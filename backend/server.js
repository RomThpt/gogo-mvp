const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock data for matches and odds
const MATCHES = [
  {
    id: 1,
    homeTeam: "PSG",
    awayTeam: "Barcelona",
    homeTeamLogo: "/logos/psg.png",
    awayTeamLogo: "/logos/barcelona.png",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: "upcoming",
    homeOdds: 2.1,
    drawOdds: 3.4,
    awayOdds: 3.2,
    fanTokens: {
      home: "PSG_TOKEN",
      away: "BAR_TOKEN"
    }
  },
  {
    id: 2,
    homeTeam: "Real Madrid",
    awayTeam: "Manchester City",
    homeTeamLogo: "/logos/real-madrid.png",
    awayTeamLogo: "/logos/manchester-city.png",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    status: "upcoming",
    homeOdds: 2.5,
    drawOdds: 3.1,
    awayOdds: 2.8,
    fanTokens: {
      home: "REAL_TOKEN",
      away: "CITY_TOKEN"
    }
  }
];

// Mock user data
const USERS = new Map();

// Contract configuration
const KLIM_CONTRACT_ADDRESS = process.env.KLIM_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const KLIM_ABI = [
  "function placeBet(address user, uint256 amount, bool isFanToken) external payable",
  "function processResult(address user, uint256 betId, bool win) external",
  "function getUserBets(address user) external view returns (tuple(uint256 amount, bool isFanToken, uint256 timestamp, bool processed, bool won, uint256 payout)[])",
  "function getUserFreebets(address user) external view returns (uint256)",
  "function getUserPositions(address user) external view returns (tuple(uint256 amount, uint256 unlockTimestamp, bool claimed, bool restaked)[])",
  "function getClaimableAmount(address user) external view returns (uint256)"
];

// Initialize provider and contract
let provider, contract;
try {
  provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
  if (KLIM_CONTRACT_ADDRESS !== "0x...") {
    contract = new ethers.Contract(KLIM_CONTRACT_ADDRESS, KLIM_ABI, provider);
  }
} catch (error) {
  console.log("Running in mock mode - no blockchain connection");
}

// Routes

// Get all available matches
app.get('/api/matches', (req, res) => {
  res.json(MATCHES);
});

// Get specific match
app.get('/api/matches/:id', (req, res) => {
  const match = MATCHES.find(m => m.id === parseInt(req.params.id));
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  res.json(match);
});

// Calculate boosted odds
app.post('/api/calculate-odds', (req, res) => {
  const { matchId, prediction, fanToken } = req.body;
  
  const match = MATCHES.find(m => m.id === matchId);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  let baseOdds;
  switch(prediction) {
    case 'home': baseOdds = match.homeOdds; break;
    case 'draw': baseOdds = match.drawOdds; break;
    case 'away': baseOdds = match.awayOdds; break;
    default: return res.status(400).json({ error: 'Invalid prediction' });
  }

  // Apply fan token boost (+3.8%)
  let boostedOdds = baseOdds;
  let hasBoost = false;
  
  if (fanToken) {
    if ((prediction === 'home' && fanToken === match.fanTokens.home) ||
        (prediction === 'away' && fanToken === match.fanTokens.away)) {
      boostedOdds = baseOdds * 1.038; // +3.8% boost
      hasBoost = true;
    }
  }

  res.json({
    baseOdds,
    boostedOdds: Math.round(boostedOdds * 100) / 100,
    boost: hasBoost ? 3.8 : 0,
    fanToken: fanToken || null
  });
});

// Place bet
app.post('/api/bets', async (req, res) => {
  const { userAddress, matchId, prediction, amount, fanToken } = req.body;
  
  try {
    const match = MATCHES.find(m => m.id === matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Calculate odds
    const oddsResponse = await fetch('http://localhost:3001/api/calculate-odds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, prediction, fanToken })
    });
    const { boostedOdds } = await oddsResponse.json();

    // Create bet record
    const bet = {
      id: Date.now(),
      userAddress,
      matchId,
      prediction,
      amount: parseFloat(amount),
      odds: boostedOdds,
      fanToken: fanToken || null,
      timestamp: new Date(),
      status: 'pending',
      processed: false
    };

    // Store bet (in production, this would go to database)
    if (!USERS.has(userAddress)) {
      USERS.set(userAddress, { bets: [], freebets: 0, positions: [] });
    }
    USERS.get(userAddress).bets.push(bet);

    res.json({ success: true, bet });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ error: 'Failed to place bet' });
  }
});

// Get user data
app.get('/api/users/:address', (req, res) => {
  const { address } = req.params;
  const userData = USERS.get(address) || { bets: [], freebets: 0, positions: [] };
  res.json(userData);
});

// Process bet result (admin only)
app.post('/api/admin/process-result', (req, res) => {
  const { userAddress, betId, won } = req.body;
  
  const userData = USERS.get(userAddress);
  if (!userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  const bet = userData.bets.find(b => b.id === betId);
  if (!bet) {
    return res.status(404).json({ error: 'Bet not found' });
  }

  bet.processed = true;
  bet.won = won;

  if (won) {
    bet.payout = bet.amount * bet.odds;
    bet.status = 'won';
  } else {
    bet.status = 'lost';
    // Process loss: generate freebets and claimable position
    const freebetAmount = bet.amount * 0.3; // 30% as freebets
    const claimableAmount = bet.amount * 0.2; // 20% claimable after 14 days
    
    userData.freebets += freebetAmount;
    userData.positions.push({
      amount: claimableAmount,
      unlockTimestamp: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days
      claimed: false,
      restaked: false
    });
  }

  res.json({ success: true, bet });
});

// Get fan token prices (mock)
app.get('/api/fan-tokens', (req, res) => {
  res.json([
    { symbol: 'PSG', name: 'PSG Fan Token', price: 2.45, change24h: +5.2 },
    { symbol: 'BAR', name: 'Barcelona Fan Token', price: 1.89, change24h: -2.1 },
    { symbol: 'REAL', name: 'Real Madrid Fan Token', price: 3.12, change24h: +1.8 },
    { symbol: 'CITY', name: 'Manchester City Fan Token', price: 2.78, change24h: +3.4 }
  ]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 GOGO Backend running on port ${PORT}`);
  console.log(`📊 Matches loaded: ${MATCHES.length}`);
  console.log(`🔗 Contract: ${KLIM_CONTRACT_ADDRESS}`);
});