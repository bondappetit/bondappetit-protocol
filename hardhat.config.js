require("hardhat-deploy");
require("dotenv").config();
const networks = require("./networks");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.6.2",
  defaultNetwork: "development",
  networks: {
    development: {
      url: "http://127.0.0.1:8545",
      chainId: 999,
      from: networks.development.accounts.Governor.address,
      gasPrice: parseInt(networks.development.gasPrice, 10),
      accounts: {
        mnemonic: process.env.MNENOMIC,
      },
    },
    ropsten: {
      url: "http://46.165.249.37:8545",
      chainId: 3,
      from: networks.ropsten.accounts.Governor.address,
      gasPrice: parseInt(networks.ropsten.gasPrice, 10),
      accounts: {
        mnemonic: process.env.MNENOMIC,
      },
    },
  },
};
