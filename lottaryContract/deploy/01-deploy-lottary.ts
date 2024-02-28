import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../utils/verify"
import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import dotenv from "dotenv"

dotenv.config()

const EtherAPI = process.env.API_KEY
const feedIt: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let chainId: number | any = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock
    const fundAmount = ethers.parseEther("1")
    console.log(chainId)
    if (chainId == 31337) {
        // create VRFV2 Subscription
        vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        const VRFCoordinatorV2MockContract = await ethers.getContractAt(
            vrfCoordinatorV2Mock.abi,
            vrfCoordinatorV2Address
        )

        const transactionResponse = await VRFCoordinatorV2MockContract.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.events[0].args.subId
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await VRFCoordinatorV2MockContract.fundSubscription(subscriptionId, fundAmount)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const args: any[] = [
        vrfCoordinatorV2Address,
        networkConfig[chainId]["raffleEntranceFee"],
        networkConfig[chainId]["gasLane"],
        subscriptionId,
        networkConfig[chainId]["callbackGasLimit"],
        networkConfig[chainId]["keepersUpdateInterval"],
    ]

    log("-----------------------------------")
    log("Deploying lottary and waiting for confirmation...")
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log(`Raffle deployed at ${raffle.address}`)

    // Ensure the Raffle contract is a valid consumer of the VRFCoordinatorV2Mock contract.
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        const VRFCoordinatorV2MockContract = await ethers.getContractAt(
            vrfCoordinatorV2Mock.abi,
            vrfCoordinatorV2Address
        )
        await VRFCoordinatorV2MockContract.addConsumer(subscriptionId, raffle.address)
    }

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.API_KEY) {
        log("Verifying...")
        await verify(raffle.address, args)
    }
}

export default feedIt
feedIt.tags = ["all", "feed"]
