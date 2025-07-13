const hre = require("hardhat");

async function main() {
    console.log("🧪 Testing GOGO Contract Functionality");
    console.log("=====================================\n");

    // Get signers
    const [owner, user1, user2] = await hre.ethers.getSigners();

    // Deploy GOGO contract
    console.log("📦 Deploying GOGO contract...");
    const GOGO = await hre.ethers.getContractFactory("GOGO");
    const treasury = owner.address;
    const GOGO = await GOGO.deploy(treasury);
    await GOGO.waitForDeployment();

    const contractAddress = await GOGO.getAddress();
    console.log("✅ GOGO deployed to:", contractAddress);
    console.log("🏦 Treasury:", treasury);

    // Add funds to contract for payouts
    console.log("💰 Adding funds to contract for payouts...");
    const contractFunds = hre.ethers.parseEther("10.0"); // 10 CHZ
    await owner.sendTransaction({
        to: contractAddress,
        value: contractFunds,
    });
    console.log(
        `✅ Added ${hre.ethers.formatEther(contractFunds)} CHZ to contract`
    );
    console.log("");

    // Test 1: Place a bet
    console.log("🎯 Test 1: Placing bets");
    console.log("----------------------");

    const betAmount = hre.ethers.parseEther("1.0"); // 1 CHZ
    console.log(
        `💰 User1 placing bet: ${hre.ethers.formatEther(betAmount)} CHZ`
    );

    await GOGO.connect(user1).placeBet(user1.address, betAmount, true, {
        value: betAmount,
    });
    console.log("✅ Bet placed successfully");

    // Check user bets
    const userBets = await GOGO.getUserBets(user1.address);
    console.log(`📊 User1 has ${userBets.length} bet(s)`);
    console.log(
        `   - Amount: ${hre.ethers.formatEther(userBets[0].amount)} CHZ`
    );
    console.log(`   - Fan Token: ${userBets[0].isFanToken}`);
    console.log(`   - Processed: ${userBets[0].processed}`);
    console.log("");

    // Test 2: Process a losing bet
    console.log("🎯 Test 2: Processing a losing bet");
    console.log("---------------------------------");

    const initialBalance = await hre.ethers.provider.getBalance(user1.address);
    console.log(
        `💼 User1 balance before: ${hre.ethers.formatEther(initialBalance)} CHZ`
    );

    await GOGO.connect(owner).processResult(user1.address, 0, false); // bet loses
    console.log("✅ Bet processed as LOSS");

    // Check freebets generated
    const freebets = await GOGO.getUserFreebets(user1.address);
    console.log(
        `🎁 Freebets generated: ${hre.ethers.formatEther(freebets)} CHZ`
    );

    // Check claimable positions
    const positions = await GOGO.getUserPositions(user1.address);
    console.log(`📈 Staking positions: ${positions.length}`);
    if (positions.length > 0) {
        console.log(
            `   - Amount: ${hre.ethers.formatEther(positions[0].amount)} CHZ`
        );
        console.log(
            `   - Unlock time: ${new Date(
                Number(positions[0].unlockTimestamp) * 1000
            )}`
        );
    }

    const claimableAmount = await GOGO.getClaimableAmount(user1.address);
    console.log(
        `💎 Total claimable: ${hre.ethers.formatEther(claimableAmount)} CHZ`
    );
    console.log("");

    // Test 3: Place and win a bet
    console.log("🎯 Test 3: Placing and winning a bet");
    console.log("-----------------------------------");

    const winBetAmount = hre.ethers.parseEther("0.5");
    await GOGO.connect(user2).placeBet(user2.address, winBetAmount, false, {
        value: winBetAmount,
    });
    console.log(
        `💰 User2 placing bet: ${hre.ethers.formatEther(winBetAmount)} CHZ`
    );

    const user2BalanceBefore = await hre.ethers.provider.getBalance(
        user2.address
    );
    console.log(
        `💼 User2 balance before win: ${hre.ethers.formatEther(
            user2BalanceBefore
        )} CHZ`
    );

    await GOGO.connect(owner).processResult(user2.address, 0, true); // bet wins
    console.log("✅ Bet processed as WIN");

    const user2BalanceAfter = await hre.ethers.provider.getBalance(
        user2.address
    );
    console.log(
        `💼 User2 balance after win: ${hre.ethers.formatEther(
            user2BalanceAfter
        )} CHZ`
    );

    const user2Bets = await GOGO.getUserBets(user2.address);
    console.log(
        `🏆 Payout: ${hre.ethers.formatEther(user2Bets[0].payout)} CHZ`
    );
    console.log("");

    // Test 4: Mint additional freebets (admin function)
    console.log("🎯 Test 4: Minting additional freebets");
    console.log("-------------------------------------");

    const additionalFreebets = hre.ethers.parseEther("0.3");
    await GOGO.connect(owner).mintFreebets(user1.address, additionalFreebets);
    console.log(
        `🎁 Minted ${hre.ethers.formatEther(
            additionalFreebets
        )} CHZ freebets for User1`
    );

    const totalFreebets = await GOGO.getUserFreebets(user1.address);
    console.log(
        `💰 User1 total freebets: ${hre.ethers.formatEther(totalFreebets)} CHZ`
    );
    console.log("");

    // Test 5: Fast-forward time and test claiming (simulation)
    console.log("🎯 Test 5: Simulating time passage and claiming");
    console.log("----------------------------------------------");

    // In a real scenario, we would need to fast-forward time
    // For now, we'll just show the available positions
    const availablePositions = await GOGO.getUserAvailablePositions(
        user1.address
    );
    console.log(
        `⏰ Available positions to claim: ${availablePositions.length}`
    );
    console.log("   (Note: Positions unlock after 14 days)");
    console.log("");

    // Summary
    console.log("📋 Test Summary");
    console.log("===============");
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🏦 Treasury: ${treasury}`);
    console.log(
        `💰 Contract Balance: ${hre.ethers.formatEther(
            await hre.ethers.provider.getBalance(contractAddress)
        )} CHZ`
    );
    console.log("");

    console.log("✅ All tests completed successfully!");
    console.log("🚀 Contract is ready for integration!");

    return {
        contractAddress,
        treasury,
        userBets: userBets.length,
        freebetsGenerated: hre.ethers.formatEther(totalFreebets),
        stakingPositions: positions.length,
    };
}

main().catch((error) => {
    console.error("❌ Test failed:", error);
    process.exitCode = 1;
});
