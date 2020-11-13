const {delay} = require('./utils');
const Migrations = artifacts.require("Migrations");

module.exports = async (deployer, network) => {
  await deployer.deploy(Migrations);

  if (network !== 'development') await delay(30000);
};
