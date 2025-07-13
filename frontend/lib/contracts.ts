import { ethers } from "ethers";

export const GOGO_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_GOGO_CONTRACT_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const GOGO_ABI = [
    {
        inputs: [
            { internalType: "address", name: "_treasury", type: "address" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            { internalType: "address", name: "user", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "bool", name: "isFanToken", type: "bool" },
        ],
        name: "placeBet",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "user", type: "address" },
            { internalType: "uint256", name: "betId", type: "uint256" },
            { internalType: "bool", name: "win", type: "bool" },
        ],
        name: "processResult",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserBets",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "amount",
                        type: "uint256",
                    },
                    { internalType: "bool", name: "isFanToken", type: "bool" },
                    {
                        internalType: "uint256",
                        name: "timestamp",
                        type: "uint256",
                    },
                    { internalType: "bool", name: "processed", type: "bool" },
                    { internalType: "bool", name: "won", type: "bool" },
                    {
                        internalType: "uint256",
                        name: "payout",
                        type: "uint256",
                    },
                ],
                internalType: "struct GOGO.Bet[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserFreebets",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "betId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isFanToken",
                type: "bool",
            },
        ],
        name: "BetPlaced",
        type: "event",
    },
] as const;

export const LOCALHOST_CONFIG = {
    chainId: 31337,
    name: "Localhost Hardhat",
    nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: ["http://127.0.0.1:8545"],
    blockExplorerUrls: [],
};

export const CHILIZ_TESTNET_CONFIG = {
    chainId: 88882,
    name: "Chiliz Spicy Testnet",
    nativeCurrency: {
        name: "CHZ",
        symbol: "CHZ",
        decimals: 18,
    },
    rpcUrls: ["https://spicy-rpc.chiliz.com/"],
    blockExplorerUrls: ["https://testnet.chiliscan.com/"],
};

export const CHILIZ_MAINNET_CONFIG = {
    chainId: 88888,
    name: "Chiliz Chain",
    nativeCurrency: {
        name: "CHZ",
        symbol: "CHZ",
        decimals: 18,
    },
    rpcUrls: ["https://rpc.ankr.com/chiliz"],
    blockExplorerUrls: ["https://chiliscan.com/"],
};

export function getContract(signer?: ethers.Signer) {
    const provider =
        signer?.provider ||
        new ethers.JsonRpcProvider(LOCALHOST_CONFIG.rpcUrls[0]);
    return new ethers.Contract(
        GOGO_CONTRACT_ADDRESS,
        GOGO_ABI,
        signer || provider
    );
}
