const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log(
        "Account balance:",
        (await deployer.provider.getBalance(deployer.address)).toString()
    );

    // Deploy KLIM contract
    const KLIM = await hre.ethers.getContractFactory("KLIM");
    const treasury = deployer.address; // Use deployer as treasury for demo

    // Deploy with custom gas parameters
    const klim = await KLIM.deploy(treasury, {
        maxFeePerGas: hre.ethers.parseUnits("25", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("1", "gwei"),
        gasLimit: 3000000,
    });

    await klim.waitForDeployment();

    console.log("KLIM deployed to:", await klim.getAddress());
    console.log("Treasury address:", treasury);

    // Verify deployment
    const deployedTreasury = await klim.treasury();
    console.log("Contract treasury:", deployedTreasury);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
