module.exports = {
  networkName: "mainnet",
  networkUrl: "https://mainnet.bondappetit.io",
  networkEtherscan: "https://etherscan.io",
  networkId: 1,
  gasPrice: "2000000000",
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
