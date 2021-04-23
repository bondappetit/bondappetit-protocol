module.exports = {
  networkName: 'mainnetBSC',
  networkUrl: 'https://bsc-dataseed.binance.org',
  networkEtherscan: 'http://bscscan.com',
  networkId: 56,
  gasPrice: '5000000000',
  averageBlockTime: '3',
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
