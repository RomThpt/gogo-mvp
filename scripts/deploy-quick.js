const hre = require("hardhat");

async function main() {
    console.log("🚀 Quick Deploy to Chiliz Testnet...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "CHZ");

    // Deploy GOGO contract
    const GOGOFactory = await hre.ethers.getContractFactory("GOGO");
    console.log("Deploying GOGO...");

    const gogo = await GOGOFactory.deploy(deployer.address, {
        gasLimit: 3000000, // Set explicit gas limit
    });

    console.log("Transaction hash:", gogo.deploymentTransaction().hash);
    console.log("Waiting for 1 confirmation...");

    // Wait for just 1 confirmation
    await gogo.deploymentTransaction().wait(1);

    const contractAddress = await gogo.getAddress();
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
