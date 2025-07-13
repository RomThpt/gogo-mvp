const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
require("dotenv").config();

// Load local configuration if available
let localConfig = {};
try {
    localConfig = require("./local-config");
    console.log("🔧 Using local configuration");
} catch (error) {
    console.log("📄 Using .env configuration");
}

const app = express();
const PORT = localConfig.PORT || process.env.PORT || 3001;

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
            away: "BAR_TOKEN",
        },
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
            away: "CITY_TOKEN",
        },
    },
];

// Mock user data
const USERS = new Map();

// Contract configuration
const GOGO_CONTRACT_ADDRESS =
    localConfig.GOGO_CONTRACT_ADDRESS ||
    process.env.GOGO_CONTRACT_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PRIVATE_KEY = localConfig.PRIVATE_KEY || process.env.PRIVATE_KEY;
const RPC_URL =
    localConfig.RPC_URL || process.env.RPC_URL || "http://localhost:8545";

const GOGO_ABI = [
    "function placeBet(address user, uint256 amount, bool isFanToken) external payable",
    "function processResult(address user, uint256 betId, bool win) external",
    "function getUserBets(address user) external view returns (tuple(uint256 amount, bool isFanToken, uint256 timestamp, bool processed, bool won, uint256 payout)[])",
    "function getUserFreebets(address user) external view returns (uint256)",
    "function getUserPositions(address user) external view returns (tuple(uint256 amount, uint256 unlockTimestamp, bool claimed, bool restaked)[])",
    "function getClaimableAmount(address user) external view returns (uint256)",
    "function getUserAvailablePositions(address user) external view returns (uint256[])",
    "function claimUserShare(uint256 positionId) external",
    "function restakePosition(uint256 positionId) external",
    "function mintFreebets(address user, uint256 amount) external",
    "function useFreebets(address user, uint256 amount) external",
];

// Initialize provider and contract
let provider, contract, ownerWallet;
try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    contract = new ethers.Contract(GOGO_CONTRACT_ADDRESS, GOGO_ABI, provider);

    // Initialize owner wallet for admin functions
    if (PRIVATE_KEY) {
        ownerWallet = new ethers.Wallet(PRIVATE_KEY, provider);
        contract = contract.connect(ownerWallet);
    }

    console.log("✅ Connected to GOGO contract at:", GOGO_CONTRACT_ADDRESS);
} catch (error) {
    console.log(
        "⚠️ Running in mock mode - no blockchain connection:",
        error.message
    );
}

// Routes

// Get all available matches
app.get("/api/matches", (req, res) => {
    res.json(MATCHES);
});

// Get specific match
app.get("/api/matches/:id", (req, res) => {
    const match = MATCHES.find((m) => m.id === parseInt(req.params.id));
    if (!match) {
        return res.status(404).json({ error: "Match not found" });
    }
    res.json(match);
});

// Calculate boosted odds
app.post("/api/calculate-odds", (req, res) => {
    const { matchId, prediction, fanToken } = req.body;

    const match = MATCHES.find((m) => m.id === matchId);
    if (!match) {
        return res.status(404).json({ error: "Match not found" });
    }

    let baseOdds;
    switch (prediction) {
        case "home":
            baseOdds = match.homeOdds;
            break;
        case "draw":
            baseOdds = match.drawOdds;
            break;
        case "away":
            baseOdds = match.awayOdds;
            break;
        default:
            return res.status(400).json({ error: "Invalid prediction" });
    }

    // Apply fan token boost (+3.8%)
    let boostedOdds = baseOdds;
    let hasBoost = false;

    if (fanToken) {
        if (
            (prediction === "home" && fanToken === match.fanTokens.home) ||
            (prediction === "away" && fanToken === match.fanTokens.away)
        ) {
            boostedOdds = baseOdds * 1.038; // +3.8% boost
            hasBoost = true;
        }
    }

    res.json({
        baseOdds,
        boostedOdds: Math.round(boostedOdds * 100) / 100,
        boost: hasBoost ? 3.8 : 0,
        fanToken: fanToken || null,
    });
});

// Place bet
app.post("/api/bets", async (req, res) => {
    const { userAddress, matchId, prediction, amount, fanToken } = req.body;

    try {
        const match = MATCHES.find((m) => m.id === matchId);
        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }

        // Calculate odds
        const oddsResponse = await fetch(
            "http://localhost:3001/api/calculate-odds",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matchId, prediction, fanToken }),
            }
        );
        const { boostedOdds } = await oddsResponse.json();

        if (contract) {
            // Real blockchain interaction
            const betAmountWei = ethers.parseEther(amount.toString());
            const hasFanToken = !!fanToken;

            // Place bet on contract
            const tx = await contract.placeBet(
                userAddress,
                betAmountWei,
                hasFanToken,
                {
                    value: betAmountWei,
                }
            );

            await tx.wait();

            // Get updated user bets from contract
            const userBets = await contract.getUserBets(userAddress);
            const latestBet = userBets[userBets.length - 1];

            const bet = {
                id: userBets.length - 1, // bet ID from contract
                userAddress,
                matchId,
                prediction,
                amount: parseFloat(ethers.formatEther(latestBet.amount)),
                odds: boostedOdds,
                fanToken: fanToken || null,
                timestamp: new Date(Number(latestBet.timestamp) * 1000),
                status: "pending",
                processed: latestBet.processed,
                txHash: tx.hash,
            };

            res.json({ success: true, bet, txHash: tx.hash });
        } else {
            // Fallback to mock mode
            const bet = {
                id: Date.now(),
                userAddress,
                matchId,
                prediction,
                amount: parseFloat(amount),
                odds: boostedOdds,
                fanToken: fanToken || null,
                timestamp: new Date(),
                status: "pending",
                processed: false,
            };

            if (!USERS.has(userAddress)) {
                USERS.set(userAddress, {
                    bets: [],
                    freebets: 0,
                    positions: [],
                });
            }
            USERS.get(userAddress).bets.push(bet);

            res.json({ success: true, bet });
        }
    } catch (error) {
        console.error("Error placing bet:", error);
        res.status(500).json({
            error: "Failed to place bet",
            details: error.message,
        });
    }
});

// Get user data
app.get("/api/users/:address", async (req, res) => {
    const { address } = req.params;

    try {
        if (contract) {
            // Get data from contract
            const [userBets, freebets, positions, claimableAmount] =
                await Promise.all([
                    contract.getUserBets(address),
                    contract.getUserFreebets(address),
                    contract.getUserPositions(address),
                    contract.getClaimableAmount(address),
                ]);

            // Format the data
            const formattedBets = userBets.map((bet, index) => ({
                id: index,
                amount: parseFloat(ethers.formatEther(bet.amount)),
                isFanToken: bet.isFanToken,
                timestamp: new Date(Number(bet.timestamp) * 1000),
                processed: bet.processed,
                won: bet.won,
                payout: bet.payout
                    ? parseFloat(ethers.formatEther(bet.payout))
                    : 0,
                status: bet.processed ? (bet.won ? "won" : "lost") : "pending",
            }));

            const formattedPositions = positions.map((pos, index) => ({
                id: index,
                amount: parseFloat(ethers.formatEther(pos.amount)),
                unlockTimestamp: Number(pos.unlockTimestamp) * 1000,
                claimed: pos.claimed,
                restaked: pos.restaked,
                canClaim:
                    !pos.claimed &&
                    !pos.restaked &&
                    Date.now() >= Number(pos.unlockTimestamp) * 1000,
            }));

            const userData = {
                address,
                bets: formattedBets,
                freebets: parseFloat(ethers.formatEther(freebets)),
                positions: formattedPositions,
                claimableAmount: parseFloat(
                    ethers.formatEther(claimableAmount)
                ),
            };

            res.json(userData);
        } else {
            // Fallback to mock data
            const userData = USERS.get(address) || {
                bets: [],
                freebets: 0,
                positions: [],
            };
            res.json(userData);
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({
            error: "Failed to fetch user data",
            details: error.message,
        });
    }
});

// Process bet result (admin only - with contract interaction)
app.post("/api/admin/process-result", async (req, res) => {
    const { userAddress, betId, won } = req.body;

    try {
        if (contract && ownerWallet) {
            // Process result on contract
            const tx = await contract.processResult(userAddress, betId, won);
            await tx.wait();

            // Get updated user data
            const userBets = await contract.getUserBets(userAddress);
            const processedBet = userBets[betId];

            const bet = {
                id: betId,
                amount: parseFloat(ethers.formatEther(processedBet.amount)),
                processed: processedBet.processed,
                won: processedBet.won,
                payout: processedBet.payout
                    ? parseFloat(ethers.formatEther(processedBet.payout))
                    : 0,
                status: processedBet.won ? "won" : "lost",
                txHash: tx.hash,
            };

            res.json({ success: true, bet, txHash: tx.hash });
        } else {
            // Fallback to mock mode
            const userData = USERS.get(userAddress);
            if (!userData) {
                return res.status(404).json({ error: "User not found" });
            }

            const bet = userData.bets.find((b) => b.id === betId);
            if (!bet) {
                return res.status(404).json({ error: "Bet not found" });
            }

            bet.processed = true;
            bet.won = won;

            if (won) {
                bet.payout = bet.amount * bet.odds;
                bet.status = "won";
            } else {
                bet.status = "lost";
                const freebetAmount = bet.amount * 0.3;
                const claimableAmount = bet.amount * 0.2;

                userData.freebets += freebetAmount;
                userData.positions.push({
                    amount: claimableAmount,
                    unlockTimestamp: Date.now() + 14 * 24 * 60 * 60 * 1000,
                    claimed: false,
                    restaked: false,
                });
            }

            res.json({ success: true, bet });
        }
    } catch (error) {
        console.error("Error processing result:", error);
        res.status(500).json({
            error: "Failed to process result",
            details: error.message,
        });
    }
});

// Claim user share
app.post("/api/users/:address/claim/:positionId", async (req, res) => {
    const { address, positionId } = req.params;

    try {
        if (contract) {
            // Create a user wallet for the transaction
            if (!PRIVATE_KEY) {
                return res.status(400).json({
                    error: "Private key not configured for transactions",
                });
            }

            const userWallet = new ethers.Wallet(PRIVATE_KEY, provider);
            const userContract = contract.connect(userWallet);

            const tx = await userContract.claimUserShare(parseInt(positionId));
            await tx.wait();

            res.json({
                success: true,
                txHash: tx.hash,
                message: "Position claimed successfully",
            });
        } else {
            res.status(503).json({ error: "Contract not available" });
        }
    } catch (error) {
        console.error("Error claiming position:", error);
        res.status(500).json({
            error: "Failed to claim position",
            details: error.message,
        });
    }
});

// Restake position
app.post("/api/users/:address/restake/:positionId", async (req, res) => {
    const { address, positionId } = req.params;

    try {
        if (contract) {
            if (!PRIVATE_KEY) {
                return res.status(400).json({
                    error: "Private key not configured for transactions",
                });
            }

            const userWallet = new ethers.Wallet(PRIVATE_KEY, provider);
            const userContract = contract.connect(userWallet);

            const tx = await userContract.restakePosition(parseInt(positionId));
            await tx.wait();

            res.json({
                success: true,
                txHash: tx.hash,
                message: "Position restaked successfully with 5% bonus",
            });
        } else {
            res.status(503).json({ error: "Contract not available" });
        }
    } catch (error) {
        console.error("Error restaking position:", error);
        res.status(500).json({
            error: "Failed to restake position",
            details: error.message,
        });
    }
});

// Get fan token prices (mock)
app.get("/api/fan-tokens", (req, res) => {
    res.json([
        { symbol: "PSG", name: "PSG Fan Token", price: 2.45, change24h: +5.2 },
        {
            symbol: "BAR",
            name: "Barcelona Fan Token",
            price: 1.89,
            change24h: -2.1,
        },
        {
            symbol: "REAL",
            name: "Real Madrid Fan Token",
            price: 3.12,
            change24h: +1.8,
        },
        {
            symbol: "CITY",
            name: "Manchester City Fan Token",
            price: 2.78,
            change24h: +3.4,
        },
    ]);
});

// Get contract information
app.get("/api/contract/info", async (req, res) => {
    try {
        if (contract) {
            const contractBalance = await provider.getBalance(
                GOGO_CONTRACT_ADDRESS
            );

            const info = {
                address: GOGO_CONTRACT_ADDRESS,
                balance: parseFloat(ethers.formatEther(contractBalance)),
                network: RPC_URL,
                isConnected: true,
            };

            res.json(info);
        } else {
            res.json({
                address: GOGO_CONTRACT_ADDRESS,
                balance: 0,
                network: "disconnected",
                isConnected: false,
            });
        }
    } catch (error) {
        console.error("Error fetching contract info:", error);
        res.status(500).json({
            error: "Failed to fetch contract info",
            details: error.message,
        });
    }
});

// Mint freebets (admin only)
app.post("/api/admin/mint-freebets", async (req, res) => {
    const { userAddress, amount } = req.body;

    try {
        if (contract && ownerWallet) {
            const amountWei = ethers.parseEther(amount.toString());
            const tx = await contract.mintFreebets(userAddress, amountWei);
            await tx.wait();

            res.json({
                success: true,
                txHash: tx.hash,
                message: `Minted ${amount} CHZ freebets for ${userAddress}`,
            });
        } else {
            res.status(503).json({
                error: "Contract not available or not authorized",
            });
        }
    } catch (error) {
        console.error("Error minting freebets:", error);
        res.status(500).json({
            error: "Failed to mint freebets",
            details: error.message,
        });
    }
});

// Use freebets (admin only)
app.post("/api/admin/use-freebets", async (req, res) => {
    const { userAddress, amount } = req.body;

    try {
        if (contract && ownerWallet) {
            const amountWei = ethers.parseEther(amount.toString());
            const tx = await contract.useFreebets(userAddress, amountWei);
            await tx.wait();

            res.json({
                success: true,
                txHash: tx.hash,
                message: `Used ${amount} CHZ freebets for ${userAddress}`,
            });
        } else {
            res.status(503).json({
                error: "Contract not available or not authorized",
            });
        }
    } catch (error) {
        console.error("Error using freebets:", error);
        res.status(500).json({
            error: "Failed to use freebets",
            details: error.message,
        });
    }
});

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        contract: {
            address: GOGO_CONTRACT_ADDRESS,
            connected: !!contract,
        },
    });
});

app.listen(PORT, () => {
    console.log(`🚀 GOGO Backend running on port ${PORT}`);
    console.log(`📊 Matches loaded: ${MATCHES.length}`);
    console.log(`🔗 Contract: ${GOGO_CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: ${RPC_URL}`);
    console.log(
        `⚡ Contract interaction: ${
            contract ? "ENABLED" : "DISABLED (Mock mode)"
        }`
    );
});
