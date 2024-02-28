import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const baseFee = "250000000000000000";
const gasPriceLink = "1e9";

const deployIt: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    log("local Network detected! Deploying mocks...");
    await deploy("VRFCoordinatorV2Mock", {
      contract: "VRFCoordinatorV2Mock",
      from: deployer,
      log: true,
      args: [baseFee, gasPriceLink],
    });
    log("Mocks Deployed!!");
    log("----------------------------------");
    log("you are deploying to your local Network");
  }
};

export default deployIt;
deployIt.tags = ["all", "mocks"];
