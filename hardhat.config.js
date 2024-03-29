require("@nomiclabs/hardhat-web3");
require("hardhat-deploy");
require("dotenv").config();
const networks = require("./networks");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.6.12",
  defaultNetwork: "development",
  networks: {
    development: {
      url: "http://127.0.0.1:8545",
      chainId: 999,
      from: networks.development.accounts.Governor.address,
      gasPrice: parseInt(networks.development.gasPrice, 10),
      accounts: {
        mnemonic: process.env.MNENOMIC,
        unlocked: ["0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f"],
      },
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 5,
      from: networks.goerli.accounts.Governor.address,
      gasPrice: parseInt(networks.goerli.gasPrice, 10),
      accounts: {
        mnemonic: process.env.MNENOMIC,
      },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 1,
      from: networks.main.accounts.Governor.address,
      gasPrice: parseInt(networks.main.gasPrice, 10),
      accounts: process.env.GOVERNOR_PK ? [process.env.GOVERNOR_PK] : [],
    },
  },
};
