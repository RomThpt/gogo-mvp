require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "./backend/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        chilizMainnet: {
            url: "https://rpc.ankr.com/chiliz",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 88888,
        },
        chilizTestnet: {
            url: "https://spicy-rpc.chiliz.com/",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 88882,
            ignition: {
                maxFeePerGas: 3501000000000n, // 2501 gwei
                maxPriorityFeePerGas: 2_000_000_000n, // 2 gwei
                disableFeeBumping: true,
            },
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};
