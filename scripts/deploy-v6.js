const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying GOGO to Chiliz Testnet...");

    try {
        // Get the deployer account (ethers v6 syntax)
        const [deployer] = await hre.ethers.getSigners();

        console.log("Deploying contracts with the account:", deployer.address);

        // Check balance (ethers v6 syntax)
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("Account balance:", hre.ethers.formatEther(balance), "CHZ");

        if (balance === 0n) {
            console.log(
                "❌ No CHZ balance! Please fund your account with testnet CHZ"
            );
            console.log("💰 Get testnet CHZ from: https://faucet.chiliz.com/");
            return;
        }

        // Deploy GOGO contract
        const GOGO = await hre.ethers.getContractFactory("GOGO");
        const treasury = deployer.address; // Use deployer as treasury for demo

        console.log("📋 Deploying GOGO contract...");
        const GOGO = await GOGO.deploy(treasury);

        console.log("⏳ Waiting for deployment confirmation...");
        await GOGO.waitForDeployment();

        const contractAddress = await GOGO.getAddress();

        console.log("✅ GOGO deployed to:", contractAddress);
        console.log("🏛️ Treasury address:", treasury);
        console.log("🔗 Network: Chiliz Testnet (Chain ID: 88882)");

        // Verify deployment
        const deployedTreasury = await GOGO.treasury();
        console.log("✓ Contract treasury verified:", deployedTreasury);

        // Display important info for integration
        console.log("\n📋 Integration Info:");
        console.log("Contract Address:", contractAddress);
        console.log("Network: Chiliz Testnet");
        console.log("Chain ID: 88882");
        console.log("RPC URL: https://spicy-rpc.chiliz.com/");
        console.log(
            "Explorer: https://testnet.chiliscan.com/address/" + contractAddress
        );

        console.log("\n🔧 Backend Integration:");
        console.log("Update backend/.env:");
        console.log("GOGO_CONTRACT_ADDRESS=" + contractAddress);

        return contractAddress;
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);

        if (error.message.includes("insufficient funds")) {
            console.log(
                "💡 Solution: Get testnet CHZ from https://faucet.chiliz.com/"
            );
        }

        if (error.message.includes("network")) {
            console.log(
                "💡 Solution: Check your RPC connection to Chiliz testnet"
            );
        }

        if (error.message.includes("nonce")) {
            console.log("💡 Solution: Wait a moment and try again");
        }

        throw error;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
