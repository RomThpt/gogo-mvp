const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying Mock Fan Tokens and GOGO to Chiliz Testnet...");

    try {
        // Get the deployer account
        const [deployer] = await hre.ethers.getSigners();

        console.log("Deploying contracts with the account:", deployer.address);

        // Check balance
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("Account balance:", hre.ethers.formatEther(balance), "CHZ");

        if (balance === 0n) {
            console.log("❌ No CHZ balance! Please fund your account with testnet CHZ");
            console.log("💰 Get testnet CHZ from: https://faucet.chiliz.com/");
            return;
        }

        // Deploy PSG Mock Token
        console.log("\n📋 Deploying PSG Mock Token...");
        const PSGToken = await hre.ethers.getContractFactory("MockFanToken");
        const psgToken = await PSGToken.deploy(
            "Paris Saint-Germain Fan Token",
            "PSG",
            1000000, // 1 million initial supply
            {
                gasLimit: 2000000,
                gasPrice: hre.ethers.parseUnits("20", "gwei")
            }
        );

        await psgToken.waitForDeployment();
        const psgTokenAddress = await psgToken.getAddress();
        console.log("✅ PSG Token deployed to:", psgTokenAddress);

        // Deploy Barca Mock Token
        console.log("\n📋 Deploying Barca Mock Token...");
        const BarcaToken = await hre.ethers.getContractFactory("MockFanToken");
        const barcaToken = await BarcaToken.deploy(
            "FC Barcelona Fan Token",
            "BAR",
            1000000, // 1 million initial supply
            {
                gasLimit: 2000000,
                gasPrice: hre.ethers.parseUnits("20", "gwei")
            }
        );

        await barcaToken.waitForDeployment();
        const barcaTokenAddress = await barcaToken.getAddress();
        console.log("✅ Barca Token deployed to:", barcaTokenAddress);

        // Fund deployer with additional tokens
        console.log("\n💰 Minting additional tokens to deployer...");
        const additionalAmount = hre.ethers.parseUnits("10000", 18); // 10,000 tokens

        await psgToken.mint(deployer.address, additionalAmount);
        await barcaToken.mint(deployer.address, additionalAmount);

        console.log("✅ Minted 10,000 PSG tokens to:", deployer.address);
        console.log("✅ Minted 10,000 BAR tokens to:", deployer.address);

        // Verify token balances
        const psgBalance = await psgToken.balanceOf(deployer.address);
        const barcaBalance = await barcaToken.balanceOf(deployer.address);
        console.log("PSG Balance:", hre.ethers.formatEther(psgBalance));
        console.log("BAR Balance:", hre.ethers.formatEther(barcaBalance));

        // Deploy GOGO contract with real token addresses
        console.log("\n📋 Deploying GOGO contract with mock token addresses...");
        const GOGO = await hre.ethers.getContractFactory("GOGO");
        const treasury = deployer.address; // Use deployer as treasury for demo

        const gogo = await GOGO.deploy(treasury, psgTokenAddress, barcaTokenAddress, {
            gasLimit: 3000000,
            gasPrice: hre.ethers.parseUnits("20", "gwei")
        });

        console.log("⏳ Waiting for GOGO deployment confirmation...");
        await gogo.waitForDeployment();

        const gogoAddress = await gogo.getAddress();

        console.log("✅ GOGO deployed to:", gogoAddress);
        console.log("🏛️ Treasury address:", treasury);
        console.log("🔗 Network: Chiliz Testnet (Chain ID: 88882)");

        // Verify GOGO deployment
        const deployedTreasury = await gogo.treasury();
        const deployedPSG = await gogo.getPSGTokenAddress();
        const deployedBarca = await gogo.getBarcaTokenAddress();

        console.log("✓ Contract treasury verified:", deployedTreasury);
        console.log("✓ PSG token address verified:", deployedPSG);
        console.log("✓ Barca token address verified:", deployedBarca);

        // Display important info for integration
        console.log("\n📋 Integration Info:");
        console.log("GOGO Contract:", gogoAddress);
        console.log("PSG Token:", psgTokenAddress);
        console.log("Barca Token:", barcaTokenAddress);
        console.log("Network: Chiliz Testnet");
        console.log("Chain ID: 88882");
        console.log("RPC URL: https://spicy-rpc.chiliz.com/");
        console.log("Explorer: https://testnet.chiliscan.com/address/" + gogoAddress);

        console.log("\n🔧 Backend Integration:");
        console.log("Update backend/.env or local-config.js:");
        console.log("GOGO_CONTRACT_ADDRESS=" + gogoAddress);
        console.log("PSG_TOKEN_ADDRESS=" + psgTokenAddress);
        console.log("BARCA_TOKEN_ADDRESS=" + barcaTokenAddress);

        console.log("\n🎉 Deployment completed successfully!");

        return {
            gogo: gogoAddress,
            psgToken: psgTokenAddress,
            barcaToken: barcaTokenAddress
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);

        if (error.message.includes("insufficient funds")) {
            console.log("💡 Solution: Get testnet CHZ from https://faucet.chiliz.com/");
        }

        if (error.message.includes("network")) {
            console.log("💡 Solution: Check your RPC connection to Chiliz testnet");
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