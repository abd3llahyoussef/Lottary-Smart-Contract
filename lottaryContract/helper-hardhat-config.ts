import { ethers } from "hardhat"

export interface networkConfigItem {
    name?: string
    subscriptionId?: string
    gasLane?: string // 30 gwei
    keepersUpdateInterval?: string
    raffleEntranceFee?: bigint // 0.01 ETH
    callbackGasLimit?: string // 500,000 gas
    vrfCoordinatorV2?: string
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    default: {
        name: "hardhat",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        subscriptionId: "588",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        keepersUpdateInterval: "30",
        raffleEntranceFee: ethers.parseEther("0.01"), // 0.01 ETH
        callbackGasLimit: "10000000000000000", // 500,000 gas
    },
    11155111: {
        name: "sepolia",
        subscriptionId: "8368",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        keepersUpdateInterval: "30",
        raffleEntranceFee: ethers.parseEther("0.01"), // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    },
}

export const developmentChains = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6
