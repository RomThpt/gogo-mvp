import { ethers } from "ethers";

export const GOGO_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_GOGO_CONTRACT_ADDRESS ||
    "0x86979303e395cae21eee1538bd20764163be8a63";

export const PSG_TOKEN_ADDRESS =
    process.env.NEXT_PUBLIC_PSG_TOKEN_ADDRESS ||
    "0x9be59eaf153312cdbb992a0f38755f89d280030d";

export const BARCA_TOKEN_ADDRESS =
    process.env.NEXT_PUBLIC_BARCA_TOKEN_ADDRESS ||
    "0xa6290a8e9a8afda276c122f109ecb1f402d23510";

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
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "bool", name: "isFanToken", type: "bool" },
            { internalType: "address", name: "tokenAddress", type: "address" },
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
        inputs: [
            { internalType: "uint256", name: "positionId", type: "uint256" },
        ],
        name: "claimUserShare",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "positionId", type: "uint256" },
        ],
        name: "restakePosition",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "user", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "useFreebets",
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
        name: "getUserPositions",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "amount",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "unlockTimestamp",
                        type: "uint256",
                    },
                    { internalType: "bool", name: "claimed", type: "bool" },
                    { internalType: "bool", name: "restaked", type: "bool" },
                ],
                internalType: "struct GOGO.ClaimablePosition[]",
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
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getClaimableAmount",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserAvailablePositions",
        outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
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
            { indexed: false, internalType: "bool", name: "won", type: "bool" },
            {
                indexed: false,
                internalType: "uint256",
                name: "payout",
                type: "uint256",
            },
        ],
        name: "BetProcessed",
        type: "event",
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
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "FreebetsGenerated",
        type: "event",
    },
] as const;

export const ERC20_ABI = [
    {
        inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "buyTokens",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "tokenAmount", type: "uint256" },
        ],
        name: "sellTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

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
        new ethers.JsonRpcProvider(CHILIZ_TESTNET_CONFIG.rpcUrls[0]);
    return new ethers.Contract(
        GOGO_CONTRACT_ADDRESS,
        GOGO_ABI,
        signer || provider
    );
}

export function getPSGTokenContract(signer?: ethers.Signer) {
    const provider =
        signer?.provider ||
        new ethers.JsonRpcProvider(CHILIZ_TESTNET_CONFIG.rpcUrls[0]);
    return new ethers.Contract(
        PSG_TOKEN_ADDRESS,
        ERC20_ABI,
        signer || provider
    );
}

export function getBarcaTokenContract(signer?: ethers.Signer) {
    const provider =
        signer?.provider ||
        new ethers.JsonRpcProvider(CHILIZ_TESTNET_CONFIG.rpcUrls[0]);
    return new ethers.Contract(
        BARCA_TOKEN_ADDRESS,
        ERC20_ABI,
        signer || provider
    );
}

export function getTokenContract(tokenAddress: string, signer?: ethers.Signer) {
    const provider =
        signer?.provider ||
        new ethers.JsonRpcProvider(CHILIZ_TESTNET_CONFIG.rpcUrls[0]);
    return new ethers.Contract(tokenAddress, ERC20_ABI, signer || provider);
}
