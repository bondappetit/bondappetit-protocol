module.exports = {
  networkName: 'mainnet',
  networkUrl: '',
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
