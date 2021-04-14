module.exports = {
  networkName: 'mainnetBSC',
  networkUrl: 'https://bsc-dataseed.binance.org',
  networkEtherscan: 'http://bscscan.com/',
  networkId: 56,
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
