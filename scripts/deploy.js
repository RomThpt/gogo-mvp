const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log(
        "Account balance:",
        (await deployer.provider.getBalance(deployer.address)).toString()
    );

    // Deploy GOGO contract
    const GOGO = await hre.ethers.getContractFactory("GOGO");
    const treasury = deployer.address; // Use deployer as treasury for demo

    // Deploy with custom gas parameters
    const GOGO = await GOGO.deploy(treasury, {
        maxFeePerGas: hre.ethers.parseUnits("25", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("1", "gwei"),
        gasLimit: 3000000,
    });

    await GOGO.waitForDeployment();

    console.log("GOGO deployed to:", await GOGO.getAddress());
    console.log("Treasury address:", treasury);

    // Verify deployment
    const deployedTreasury = await GOGO.treasury();
    console.log("Contract treasury:", deployedTreasury);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
