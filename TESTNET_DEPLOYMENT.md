# Chiliz Testnet Deployment Guide

## Current Status
✅ **Local Deployment Complete**
- Contract Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- Network: Local Hardhat (for development)
- Status: Fully functional for demo

## Deploy to Chiliz Testnet

### Prerequisites
1. **Get Testnet CHZ**
   - Visit: https://faucet.chiliz.com/
   - Request testnet CHZ for your wallet address

2. **Configure Environment**
   ```bash
   # Update .env file
   PRIVATE_KEY=your_actual_private_key_here
   RPC_URL=https://spicy-rpc.chiliz.com/
   ```

### Deployment Steps

1. **Fund Your Account**
   ```bash
   # Check if you have testnet CHZ
   npx hardhat run scripts/check-balance.js --network chilizTestnet
   ```

2. **Deploy Contract**
   ```bash
   # Deploy to Chiliz testnet
   npx hardhat run scripts/deploy-testnet.js --network chilizTestnet
   ```

3. **Verify Deployment**
   ```bash
   # The script will output the contract address
   # Example: 0x1234567890123456789012345678901234567890
   ```

### Network Configuration

**Chiliz Testnet (Spicy)**
- Chain ID: `88882`
- RPC URL: `https://spicy-rpc.chiliz.com/`
- Explorer: `https://testnet.chiliscan.com/`
- Faucet: `https://faucet.chiliz.com/`

**Chiliz Mainnet**
- Chain ID: `88888`
- RPC URL: `https://rpc.ankr.com/chiliz`
- Explorer: `https://chiliscan.com/`

## Demo Ready Contract Addresses

### Local Development
```
Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Network: Local Hardhat
RPC: http://127.0.0.1:8545
```

### For Live Demo
To get a live testnet address, run:
```bash
npm run deploy:testnet
```

## Contract Verification

After deployment, verify your contract:
```bash
npx hardhat verify --network chilizTestnet CONTRACT_ADDRESS "TREASURY_ADDRESS"
```

## Integration

Update your backend configuration:
```javascript
// backend/server.js
const KLIM_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Local
// OR
const KLIM_CONTRACT_ADDRESS = "0xYOUR_TESTNET_ADDRESS"; // Testnet
```

## Quick Deploy Script

```bash
#!/bin/bash
echo "🚀 GOGO Testnet Deployment"

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Please set PRIVATE_KEY environment variable"
    exit 1
fi

# Deploy to testnet
echo "📋 Deploying to Chiliz testnet..."
npx hardhat run scripts/deploy-testnet.js --network chilizTestnet

echo "✅ Deployment complete!"
echo "📱 Update your backend with the contract address"
echo "🌐 Visit https://testnet.chiliscan.com/ to view your contract"
```

## Troubleshooting

### Common Issues
1. **Insufficient Funds**: Get CHZ from faucet
2. **Network Error**: Check RPC URL
3. **Gas Issues**: Ensure sufficient CHZ balance
4. **Private Key**: Use valid Ethereum private key

### Support
- Chiliz Discord: https://discord.gg/chiliz
- Documentation: https://docs.chiliz.com/
- Testnet Explorer: https://testnet.chiliscan.com/