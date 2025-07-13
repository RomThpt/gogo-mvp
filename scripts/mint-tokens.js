const hre = require("hardhat");

async function main() {
    console.log("🪙 Minting Mock Tokens...");

    try {
        // Get the deployer account (should be the owner of the mock tokens)
        const [deployer] = await hre.ethers.getSigners();

        console.log("Minting tokens with account:", deployer.address);

        // Check balance
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("Account balance:", hre.ethers.formatEther(balance), "CHZ");

        // Contract addresses (updated from your latest changes)
        const psgTokenAddress = "0x9be59eaf153312cdbb992a0f38755f89d280030d";
        const barcaTokenAddress = "0xa6290a8e9a8afda276c122f109ecb1f402d23510";

        // Your address to mint tokens to
        const recipientAddress = "0x24334b999E90849322408533C43f948245DB4c70";

        // Amount to mint (1000 tokens with 18 decimals)
        const mintAmount = hre.ethers.parseUnits("1000", 18);

        // Get contract factory
        const MockFanToken = await hre.ethers.getContractFactory(
            "MockFanToken"
        );

        // Connect to PSG token contract
        console.log("\n🔗 Connecting to PSG Token...");
        const psgToken = MockFanToken.attach(psgTokenAddress);

        // Mint PSG tokens
        console.log(`🪙 Minting 1000 PSG tokens to ${recipientAddress}...`);
        const psgTx = await psgToken.mint(recipientAddress, mintAmount);
        await psgTx.wait();
        console.log("✅ PSG tokens minted successfully!");

        // Connect to Barca token contract
        console.log("\n🔗 Connecting to Barca Token...");
        const barcaToken = MockFanToken.attach(barcaTokenAddress);

        // Mint Barca tokens
        console.log(`🪙 Minting 1000 Barca tokens to ${recipientAddress}...`);
        const barcaTx = await barcaToken.mint(recipientAddress, mintAmount);
        await barcaTx.wait();
        console.log("✅ Barca tokens minted successfully!");

        // Check balances
        const psgBalance = await psgToken.balanceOf(recipientAddress);
        const barcaBalance = await barcaToken.balanceOf(recipientAddress);

        console.log("\n📊 Final Balances:");
        console.log(
            `PSG Token balance: ${hre.ethers.formatUnits(psgBalance, 18)} PSG`
        );
        console.log(
            `Barca Token balance: ${hre.ethers.formatUnits(
                barcaBalance,
                18
            )} BAR`
        );

        console.log("\n✅ Minting completed successfully!");
    } catch (error) {
        console.error("❌ Error during minting:", error);
        process.exit(1);
    }
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
