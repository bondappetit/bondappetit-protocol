module.exports = {
  networkName: 'ropsten',
  networkUrl: 'https://ropsten.bondappetit.io',
  networkEtherscan: 'https://ropsten.etherscan.io',
  networkId: 3,
  gasPrice: '2000000000',
  accounts: {
    ...require("./accounts"),
  },
  assets: {
    ...require("./assets"),
    ...require("./gen/assets"),
  },
  contracts: {
    ...require("./contracts"),
    ...require("./gen/contracts"),
  },
};
