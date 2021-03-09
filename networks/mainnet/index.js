module.exports = {
  networkName: 'mainnet',
  networkUrl: 'https://mainnet.bondappetit.io',
  networkEtherscan: 'https://etherscan.io',
  networkId: 1,
  gasPrice: '2000000000',
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
