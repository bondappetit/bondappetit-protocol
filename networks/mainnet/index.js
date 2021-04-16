module.exports = {
  networkName: "mainnet",
  networkUrl: "https://mainnet.infura.io/v3/03d22d3114e54a6dbab0cb1c6163b48a",
  networkEtherscan: "https://etherscan.io",
  networkId: 1,
  gasPrice: "100000000000",
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
