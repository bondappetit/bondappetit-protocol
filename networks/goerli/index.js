module.exports = {
  networkName: 'goerli',
  networkUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  networkEtherscan: 'https://goerli.etherscan.io',
  networkId: 5,
  gasPrice: '60000000000',
  averageBlockTime: '13.2',
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
