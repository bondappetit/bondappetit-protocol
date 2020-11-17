module.exports = {
  networkName: 'mainnet',
  networkUrl: '',
  networkEtherscan: 'https://etherscan.io',
  networkId: 1,
  accounts: {
    ...require("./accounts"),
  },
  assets: {
    ...require("./assets"),
  },
  contracts: {
    ...require("./contracts"),
  },
};
