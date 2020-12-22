module.exports = {
  networkName: 'development',
  networkUrl: 'http://localhost:8545',
  networkEtherscan: '',
  networkId: 999,
  gasPrice: '20000000000',
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
