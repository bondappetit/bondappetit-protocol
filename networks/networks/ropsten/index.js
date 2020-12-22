module.exports = {
  networkName: 'ropsten',
  networkUrl: 'https://ropsten.infura.io/v3/b3d868f6ea5a48a1b3028b274642553f',
  networkEtherscan: 'https://ropsten.etherscan.io',
  networkId: 3,
  gasPrice: '60000000000',
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
