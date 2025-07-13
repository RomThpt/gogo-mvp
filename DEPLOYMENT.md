# GOGO MVP Deployment Guide

## Quick Start (3 minutes)

### 1. Deploy Smart Contract to Chiliz Testnet

```bash
# Set environment variables
export PRIVATE_KEY="your_private_key"

# Deploy to Chiliz Testnet
npx hardhat run scripts/deploy.js --network chilizTestnet

# Note the contract address for backend configuration
```

### 2. Start Backend API

```bash
cd backend

# Create .env file
echo "GOGO_CONTRACT_ADDRESS=deployed_contract_address" > .env
echo "RPC_URL=https://spicy-rpc.chiliz.com/" >> .env

# Install and start
npm install
node server.js
```

### 3. Start Frontend

```bash
cd frontend

# Install and start
npm install
npm run dev
```

## Demo Flow (3 minutes)

### Scenario 1: Winning Bet with Fan Token Boost

1. **Connect Wallet** → Mock wallet connects automatically
2. **Select PSG vs Barcelona** → Choose PSG to win
3. **Use PSG Fan Token** → +3.8% odds boost (2.10 → 2.18)
4. **Bet 100 CHZ** → Potential payout: 218 CHZ
5. **Simulate Win** → Admin processes result as win
6. **Show Payout** → User receives 218 CHZ

### Scenario 2: Losing Bet with Recovery

1. **Place bet on Barcelona** → 50 CHZ without fan token
2. **Simulate Loss** → Admin processes result as loss
3. **Show Recovery** →
    - 40 CHZ (80%) goes to treasury
    - 10 CHZ (20%) locked for 14 days recovery
    - 15 CHZ (30%) as freebets immediately available

### Scenario 3: Freebets Usage

1. **Show Freebets Balance** → 15 CHZ available
2. **Place Freebet** → Use on Real Madrid vs Man City
3. **Demonstrate Value** → Freebets = additional betting power

## Key Metrics to Highlight

-   **Odds Boost**: +3.8% with matching fan tokens
-   **Loss Recovery**: 20% recoverable after 14-day staking
-   **Freebets**: 30% of lost stakes as sponsored freebets
-   **Treasury**: 80% of losses fund winning payouts

## Technical Architecture

```
Frontend (Next.js) → Backend API (Node.js) → Smart Contract (Solidity)
                           ↓
                   Chiliz Testnet/Mainnet
```

## 🚀 Vercel Deployment

### Quick Deploy to Vercel

#### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

#### Method 2: GitHub Integration
1. Push to GitHub: `git push origin main`
2. Connect to Vercel dashboard
3. Import repository
4. Set build configuration

### Vercel Build Settings
- **Framework**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node.js Version**: 18.x

### Environment Variables (Vercel Dashboard)
```env
NEXT_PUBLIC_GOGO_CONTRACT_ADDRESS=0x679c9d1f45471f6a540be3230f37d9d35e81be07
NEXT_PUBLIC_PSG_TOKEN_ADDRESS=0x9be59eaf153312cdbb992a0f38755f89d280030d
NEXT_PUBLIC_BARCA_TOKEN_ADDRESS=0xa6290a8e9a8afda276c122f109ecb1f402d23510
```

## Live Demo URLs

-   **Production**: https://your-app.vercel.app (after deployment)
-   **Local Frontend**: http://localhost:3000
-   **Local Backend API**: http://localhost:3001
-   **Contract**: Deployed on Chiliz Spicy Testnet

## Business Model

1. **Platform Fee**: 2% on winning bets
2. **Fan Token Utility**: Drives token demand through betting boosts
3. **Club Partnerships**: Freebets sponsored by clubs for marketing
4. **Staking Yield**: Interest earned on locked recovery funds
