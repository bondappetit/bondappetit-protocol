const {afterMigration} = require("./utils");
const networks = require("../networks");
const Bond = artifacts.require("Bond");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(Bond, Governor.address);

  await afterMigration(network);
};
