require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { BSC_RPC_URL, BSC_TESTNET_RPC_URL, PEAQ_RPC_URL, DEPLOYER_PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    bscTestnet: {
      url: BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : []
    },
    bsc: {
      url: BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : []
    },
    peaq: {
      url: PEAQ_RPC_URL || "https://quicknode1.peaq.xyz",
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : []
    }
  }
};
