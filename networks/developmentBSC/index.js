module.exports = {
  networkName: 'developmentBSC',
  networkUrl: 'http://localhost:8546',
  networkEtherscan: '',
  networkId: 998,
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
