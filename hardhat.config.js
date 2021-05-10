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
    ropsten: {
      url: "https://ropsten.bondappetit.io",
      chainId: 3,
      from: networks.ropsten.accounts.Governor.address,
      gasPrice: parseInt(networks.ropsten.gasPrice, 10),
      accounts: {
        mnemonic: process.env.MNENOMIC,
      },
    },
    testnetBSC: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      from: networks.testnetBSC.accounts.Governor.address,
      gasPrice: parseInt(networks.testnetBSC.gasPrice, 10),
      accounts: process.env.GOVERNOR_PK ? [process.env.GOVERNOR_PK] : [],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 1,
      from: networks.main.accounts.Governor.address,
      gasPrice: parseInt(networks.main.gasPrice, 10),
      accounts: process.env.GOVERNOR_PK ? [process.env.GOVERNOR_PK] : [],
    },
    mainnetBSC: {
      url: "https://bsc-dataseed.binance.org",
      chainId: 56,
      from: networks.mainBSC.accounts.Governor.address,
      gasPrice: parseInt(networks.mainBSC.gasPrice, 10),
      accounts: process.env.GOVERNOR_PK ? [process.env.GOVERNOR_PK] : [],
    },
  },
};
