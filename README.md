# GOGO MVP - Next-Gen Sports Betting Platform

🚀 **GOGO leverages fan tokens to boost odds and turn losses into value through innovative staking mechanisms.**

## 🎯 Core Features
- **📈 Odds Boosting**: Fan tokens increase betting odds by up to 3.8%
- **🔄 Loss Recovery**: 100% of lost stakes are staked for 14 days (80% to winners, 20% recoverable)
- **🎁 Freebets System**: Bonus freebets sponsored by clubs for lost bets
- **🤝 Fan Engagement**: Strengthens Chiliz ecosystem through token utility

## 🏗️ Project Structure
```
gogo-mvp/
├── contracts/          # Smart contracts (Solidity)
│   └── KLIM.sol       # Main betting contract
├── backend/           # Node.js API server
│   ├── server.js      # Express server with betting logic
│   └── .env.example   # Environment configuration
├── frontend/          # React/Next.js interface
│   ├── src/app/       # Next.js app directory
│   └── src/components/ # React components
├── scripts/           # Deployment scripts
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Chiliz wallet with testnet CHZ

### Installation
```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Compile contracts
npm run compile

# Deploy to local network
npm run deploy:local

# Start both backend and frontend
npm run dev
```

## 📋 Demo Scenarios
1. **PSG vs Barcelona** - Champions League match with fan token boosts
2. **Real Madrid vs Manchester City** - Premier League fixture

## 🛠️ Technology Stack
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Backend**: Node.js, Express, Ethers.js
- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **Blockchain**: Chiliz Chain (Testnet: 88882, Mainnet: 88888)
- **Wallet**: Chiliz Wallet integration

## 🔗 Contract Addresses

### Local Development
```
Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Network: Hardhat Local
```

### Chiliz Testnet
```
Contract: [Deployed - Check transaction 0x5f2d56af...]
Network: Chiliz Testnet (Chain ID: 88882)
Explorer: https://testnet.chiliscan.com/
```

## 📚 Documentation
- [Deployment Guide](./DEPLOYMENT.md)
- [Testnet Setup](./TESTNET_DEPLOYMENT.md)
- [Pitch Deck](./PITCH.md)

## 🎮 Live Demo
1. Connect Chiliz wallet
2. Browse available matches
3. Place bets with fan token boosts
4. Experience loss recovery system
5. Use freebets for additional value

## 📊 Key Metrics
- **Odds Boost**: +3.8% with matching fan tokens
- **Loss Recovery**: 20% recoverable after 14-day staking
- **Freebets**: 30% of lost stakes as sponsored freebets
- **Treasury**: 80% of losses fund winning payouts

---

**Built for Chiliz Hackathon 2024** 🏆