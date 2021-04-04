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
      /*
     accounts: [
       '0x3490e2cca2c8c14a5b7b2241ca4c13b5148d36e2e48653aef6751412d5a901ed'
     ]
     */
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
    mainnet: {
      url: "https://mainnet.infura.io/v3/03d22d3114e54a6dbab0cb1c6163b48a",
      chainId: 1,
      from: networks.main.accounts.Governor.address,
      gasPrice: parseInt(networks.main.gasPrice, 10),
      accounts: process.env.GOVERNOR_PK ? [process.env.GOVERNOR_PK] : [],
    },
  },
};
