const {delay} = require('./utils');
const networks = require("../networks");
const SecurityOracle = artifacts.require("oracle/SecurityOracle");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(SecurityOracle, {
    from: Governor.address,
  });

  if (network !== 'development') await delay(30000);
};
