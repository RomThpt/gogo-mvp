const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying GOGO Platform with Fan Tokens...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

    // Deploy PSG Token
    console.log("\n📈 Deploying PSG Token...");
    const PSGToken = await hre.ethers.getContractFactory("PSGToken");
    const psgToken = await PSGToken.deploy();
    await psgToken.deploymentTransaction().wait(1);
    const psgTokenAddress = await psgToken.getAddress();
    console.log("✅ PSG Token Address:", psgTokenAddress);

    // Deploy Barcelona Token
    console.log("\n🔴 Deploying Barcelona Token...");
    const BarcaToken = await hre.ethers.getContractFactory("BarcaToken");
    const barcaToken = await BarcaToken.deploy();
    await barcaToken.deploymentTransaction().wait(1);
    const barcaTokenAddress = await barcaToken.getAddress();
    console.log("✅ Barcelona Token Address:", barcaTokenAddress);

    // Deploy GOGO Contract with token addresses
    console.log("\n🎯 Deploying GOGO Contract...");
    const GOGO = await hre.ethers.getContractFactory("GOGO");
    const gogo = await GOGO.deploy(
        deployer.address, // treasury
        psgTokenAddress,  // PSG token
        barcaTokenAddress // Barcelona token
    );
    await gogo.deploymentTransaction().wait(1);
    const gogoAddress = await gogo.getAddress();
    console.log("✅ GOGO Contract Address:", gogoAddress);

    // Add some initial liquidity to token contracts for testing
    console.log("\n💰 Adding initial liquidity to token contracts...");
    
    // Send some ETH to token contracts so users can buy tokens
    await deployer.sendTransaction({
        to: psgTokenAddress,
        value: hre.ethers.parseEther("10") // 10 ETH
    });
    
    await deployer.sendTransaction({
        to: barcaTokenAddress,
        value: hre.ethers.parseEther("10") // 10 ETH
    });

    // Send some tokens to GOGO contract for payouts
    await psgToken.transfer(gogoAddress, hre.ethers.parseEther("50000")); // 50k PSG tokens
    await barcaToken.transfer(gogoAddress, hre.ethers.parseEther("50000")); // 50k BAR tokens

    console.log("✅ Initial liquidity added");

    // Display summary
    console.log("\n🎉 Deployment Summary:");
    console.log("=".repeat(50));
    console.log("PSG Token:", psgTokenAddress);
    console.log("Barcelona Token:", barcaTokenAddress);
    console.log("GOGO Contract:", gogoAddress);
    console.log("=".repeat(50));

    // Display token exchange rates
    console.log("\n📊 Token Exchange Rates:");
    console.log("1 ETH = 50 PSG tokens");
    console.log("1 ETH = 50 BAR tokens");
    console.log("Fan token bets get 2.4x multiplier vs 2x for ETH");

    return {
        psgToken: psgTokenAddress,
        barcaToken: barcaTokenAddress,
        gogo: gogoAddress
    };
}

main().catch((error) => {
    console.error("❌ Error:", error);
    process.exitCode = 1;
});