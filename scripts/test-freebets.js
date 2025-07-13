const hre = require("hardhat");

async function main() {
    console.log("🧪 Testing Freebet Logic...");

    const [deployer, user1, user2] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("User1:", user1.address);
    console.log("User2:", user2.address);

    // Get the deployed contract
    const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
    const GOGO = await hre.ethers.getContractAt("GOGO", contractAddress);

    console.log("\n📊 Initial State:");
    console.log("User1 Freebets:", hre.ethers.formatEther(await GOGO.getUserFreebets(user1.address)));
    console.log("User2 Freebets:", hre.ethers.formatEther(await GOGO.getUserFreebets(user2.address)));

    // User1 places a bet that will lose
    console.log("\n🎲 User1 places bet (will lose):");
    const betAmount = hre.ethers.parseEther("1.0"); // 1 ETH
    
    await GOGO.connect(user1).placeBet(user1.address, betAmount, false, {
        value: betAmount
    });
    console.log("✅ Bet placed by User1");

    // Get the bet ID (should be 0 for first bet)
    const user1Bets = await GOGO.getUserBets(user1.address);
    console.log("User1 bets count:", user1Bets.length);

    // Process the bet as a loss (only owner can do this)
    console.log("\n💸 Processing bet as loss...");
    await GOGO.connect(deployer).processResult(user1.address, 0, false); // false = loss
    console.log("✅ Bet processed as loss");

    // Check the results
    console.log("\n📈 After Loss Processing:");
    const freebets = await GOGO.getUserFreebets(user1.address);
    const positions = await GOGO.getUserPositions(user1.address);
    
    console.log("User1 Freebets:", hre.ethers.formatEther(freebets), "ETH");
    console.log("User1 Positions:", positions.length);
    
    if (positions.length > 0) {
        console.log("Position 0 amount:", hre.ethers.formatEther(positions[0].amount), "ETH");
        console.log("Position 0 unlock time:", new Date(Number(positions[0].unlockTimestamp) * 1000).toLocaleString());
        console.log("Position 0 claimed:", positions[0].claimed);
        console.log("Position 0 restaked:", positions[0].restaked);
    }

    // Let's create another losing bet to test multiple positions
    console.log("\n🎲 User1 places another losing bet:");
    await GOGO.connect(user1).placeBet(user1.address, hre.ethers.parseEther("0.5"), true, {
        value: hre.ethers.parseEther("0.5")
    });
    console.log("✅ Second bet placed by User1");

    // Process second bet as loss
    console.log("\n💸 Processing second bet as loss...");
    await GOGO.connect(deployer).processResult(user1.address, 1, false); // false = loss
    console.log("✅ Second bet processed as loss");

    // Check final state
    console.log("\n📊 Final State:");
    const finalFreebets = await GOGO.getUserFreebets(user1.address);
    const finalPositions = await GOGO.getUserPositions(user1.address);
    
    console.log("User1 Final Freebets:", hre.ethers.formatEther(finalFreebets), "ETH");
    console.log("User1 Total Positions:", finalPositions.length);
    
    for (let i = 0; i < finalPositions.length; i++) {
        console.log(`Position ${i}:`, hre.ethers.formatEther(finalPositions[i].amount), "ETH");
    }

    console.log("\n🎉 Test completed! User1 should have freebets and a staked position.");
}

main().catch((error) => {
    console.error("❌ Error:", error);
    process.exitCode = 1;
});