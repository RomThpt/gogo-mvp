const hre = require("hardhat");

async function main() {
    console.log("🚀 Quick Deploy to Chiliz Testnet...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "CHZ");

    // Deploy GOGO contract
    const GOGO = await hre.ethers.getContractFactory("GOGO");
    console.log("Deploying GOGO...");

    const GOGO = await GOGO.deploy(deployer.address, {
        gasLimit: 3000000, // Set explicit gas limit
    });

    console.log("Transaction hash:", GOGO.deploymentTransaction().hash);
    console.log("Waiting for 1 confirmation...");

    // Wait for just 1 confirmation
    await GOGO.deploymentTransaction().wait(1);

    const contractAddress = await GOGO.getAddress();
    console.log("✅ GOGO Contract Address:", contractAddress);
    console.log(
        "🔗 Explorer:",
        `https://testnet.chiliscan.com/address/${contractAddress}`
    );

    return contractAddress;
}

main().catch((error) => {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;
});
