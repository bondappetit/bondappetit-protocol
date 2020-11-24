const {afterMigration} = require('./utils');
const Migrations = artifacts.require("Migrations");

module.exports = async (deployer, network) => {
  await deployer.deploy(Migrations);

  await afterMigration(network);
};
