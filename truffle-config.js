const networks = require("./networks");
const HDWalletProvider = require("@truffle/hdwallet-provider");

require("dotenv").config();

module.exports = {
  compilers: {
    solc: {
      version: "0.6.12",
      parser: "solcjs",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    development: {
      from: networks.development.accounts.Governor.address,
      host: "localhost",
      port: 8545,
      network_id: "999", // Match any network id
    },
    // testnets
    // properties
    // network_id: identifier for network based on ethereum blockchain. Find out more at https://github.com/ethereumbook/ethereumbook/issues/110
    // gas: gas limit
    // gasPrice: gas price in gwei
    ropsten: {
      from: networks.ropsten.accounts.Governor.address,
      provider: () =>
        new HDWalletProvider({
          mnemonic: process.env.MNENOMIC,
          providerOrUrl:
            "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY,
          pollingInterval: 15000,
        }),
      network_id: "3",
      gas: 5500000,
      gasPrice: 100000000000,
      deploymentPollingInterval: 15000,
    },
    // kovan: {
    //   from: networks.kovan.accounts.Governor.address,
    //   provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://kovan.infura.io/v3/" + process.env.INFURA_API_KEY),
    //   network_id: '42',
    //   gas: 8000000,
    //   gasPrice: 10000000000
    // },
    // rinkeby: {
    //   from: networks.rinkeby.accounts.Governor.address,
    //   provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY),
    //   network_id: '4',
    //   gas: 8000000,
    //   gasPrice: 10000000000
    // },
    // main ethereum network(mainnet)
    // mainnet: {
    //   from: networks.mainnet.accounts.Governor.address,
    //   provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY),
    //   network_id: '1',
    //   gas: 8000000,
    //   gasPrice: 10000000000
    // }
  },
};
