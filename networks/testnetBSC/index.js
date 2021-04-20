module.exports = {
  networkName: 'testnetBSC',
  networkUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  networkEtherscan: 'http://testnet.bscscan.com',
  networkId: 97,
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
