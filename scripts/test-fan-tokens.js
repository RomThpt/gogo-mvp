const hre = require("hardhat");

async function main() {
    console.log("🧪 Testing Fan Token Workflow...");

    const [deployer, user] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Test User:", user.address);

    // Contract addresses from deployment
    const psgTokenAddress = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
    const barcaTokenAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";
    const gogoAddress = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";

    // Get contract instances
    const psgToken = await hre.ethers.getContractAt("PSGToken", psgTokenAddress);
    const barcaToken = await hre.ethers.getContractAt("BarcaToken", barcaTokenAddress);
    const gogo = await hre.ethers.getContractAt("GOGO", gogoAddress);

    console.log("\n💰 Initial balances:");
    console.log("User ETH balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(user.address)));
    console.log("User PSG balance:", hre.ethers.formatEther(await psgToken.balanceOf(user.address)));
    console.log("User BAR balance:", hre.ethers.formatEther(await barcaToken.balanceOf(user.address)));

    // Step 1: Buy PSG tokens
    console.log("\n🛒 Step 1: Buying PSG tokens...");
    const buyTx = await psgToken.connect(user).buyTokens({ value: hre.ethers.parseEther("1") });
    await buyTx.wait();
    console.log("✅ Bought PSG tokens with 1 ETH");

    console.log("\n💰 After buying PSG tokens:");
    console.log("User ETH balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(user.address)));
    console.log("User PSG balance:", hre.ethers.formatEther(await psgToken.balanceOf(user.address)));

    // Step 2: Approve GOGO contract to spend PSG tokens
    console.log("\n✅ Step 2: Approving GOGO contract to spend PSG tokens...");
    const approveTx = await psgToken.connect(user).approve(gogoAddress, hre.ethers.parseEther("10"));
    await approveTx.wait();
    console.log("✅ Approved GOGO contract to spend 10 PSG tokens");

    // Step 3: Place a fan token bet
    console.log("\n🎲 Step 3: Placing fan token bet...");
    const betTx = await gogo.connect(user)["placeBet(address,uint256,bool,address)"](
        user.address,
        hre.ethers.parseEther("5"), // 5 PSG tokens
        true, // isFanToken
        psgTokenAddress
    );
    await betTx.wait();
    console.log("✅ Placed bet with 5 PSG tokens");

    console.log("\n💰 After placing bet:");
    console.log("User PSG balance:", hre.ethers.formatEther(await psgToken.balanceOf(user.address)));
    console.log("GOGO PSG balance:", hre.ethers.formatEther(await psgToken.balanceOf(gogoAddress)));

    // Step 4: Check user bets
    console.log("\n📊 Step 4: Checking user bets...");
    const userBets = await gogo.getUserBets(user.address);
    console.log("User has", userBets.length, "bet(s)");
    if (userBets.length > 0) {
        const lastBet = userBets[userBets.length - 1];
        console.log("Last bet amount:", hre.ethers.formatEther(lastBet.amount), "tokens");
        console.log("Is fan token bet:", lastBet.isFanToken);
        console.log("Bet processed:", lastBet.processed);
    }

    console.log("\n🎉 Fan token workflow test completed successfully!");
}

main().catch((error) => {
    console.error("❌ Error:", error);
    process.exitCode = 1;
});