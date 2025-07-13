const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying GOGO Staking Contract with Chiliz Integration...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    // Contract addresses - these would be the actual Chiliz mainnet addresses
    const TREASURY_ADDRESS = deployer.address; // For demo purposes
    const PSG_TOKEN_ADDRESS = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const BARCA_TOKEN_ADDRESS = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";
    
    // Chiliz Spicy Testnet Validator Address
    const CHILIZ_STAKING_ADDRESS = "0xbdBF08393b66130B4b243863150A265b2A5Df642";
    console.log("🧪 Using Chiliz Spicy Testnet validator address");

    console.log("🏟️  Treasury Address:", TREASURY_ADDRESS);
    console.log("⚽ PSG Token Address:", PSG_TOKEN_ADDRESS);
    console.log("🔴 Barca Token Address:", BARCA_TOKEN_ADDRESS);
    console.log("🔗 Chiliz Staking Address:", CHILIZ_STAKING_ADDRESS);

    // Deploy the GOGO Staking contract
    console.log("\n🏗️  Deploying GOGOStaking contract...");
    const GOGOStaking = await ethers.getContractFactory("GOGOStaking");
    const gogoStaking = await GOGOStaking.deploy(
        TREASURY_ADDRESS,
        PSG_TOKEN_ADDRESS,
        BARCA_TOKEN_ADDRESS,
        CHILIZ_STAKING_ADDRESS
    );

    await gogoStaking.waitForDeployment();
    const gogoStakingAddress = await gogoStaking.getAddress();

    console.log("✅ GOGOStaking deployed to:", gogoStakingAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const deployedTreasury = await gogoStaking.treasury();
    const deployedPSG = await gogoStaking.psgToken();
    const deployedBarca = await gogoStaking.barcaToken();
    const totalStaked = await gogoStaking.getTotalStakedInProtocol();

    console.log("📊 Contract verification:");
    console.log("  - Treasury:", deployedTreasury);
    console.log("  - PSG Token:", deployedPSG);
    console.log("  - Barca Token:", deployedBarca);
    console.log("  - Total Staked in Protocol:", ethers.formatEther(totalStaked), "CHZ");

    // Save deployment info
    const deploymentInfo = {
        network: "localhost",
        gogoStaking: gogoStakingAddress,
        treasury: TREASURY_ADDRESS,
        psgToken: PSG_TOKEN_ADDRESS,
        barcaToken: BARCA_TOKEN_ADDRESS,
        chilizStaking: CHILIZ_STAKING_ADDRESS,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        features: [
            "Chiliz Chain Staking Integration",
            "80/20 Revenue Split",
            "14-day Cooldown Period",
            "Automatic Staking Rewards Distribution",
            "5% Restaking Bonus"
        ]
    };

    console.log("\n📋 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎯 Next Steps:");
    console.log("1. Update GOGO_CONTRACT_ADDRESS in frontend/lib/contracts.ts");
    console.log("2. Update environment variables");
    console.log("3. Test staking functionality");
    console.log("4. Integrate with actual Chiliz staking protocol");

    console.log("\n⚠️  Important Notes:");
    console.log("- Replace CHILIZ_STAKING_ADDRESS with actual Chiliz staking contract");
    console.log("- Ensure proper permissions for staking protocol integration");
    console.log("- Test thoroughly on Chiliz testnet before mainnet deployment");

    return {
        gogoStaking: gogoStakingAddress,
        deploymentInfo
    };
}

// Handle script execution
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;