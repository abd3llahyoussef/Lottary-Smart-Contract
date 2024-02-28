import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import "hardhat-deploy";

dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || "";
const ApiKey = process.env.API_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    localhost: {
      url: LOCAL_RPC_URL,
      chainId: 31337,
    },
  },
  solidity: { compilers: [{ version: "0.8.19" }, { version: "0.6.6" }] },
  etherscan: {
    apiKey: ApiKey,
  },
  namedAccounts: { deployer: { default: 0, 1: 0 } },
};

export default config;
