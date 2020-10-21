module.exports = {
  compilers: {
    solc: {
      version: "0.5.17",
      parser: "solcjs",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
  },
};
