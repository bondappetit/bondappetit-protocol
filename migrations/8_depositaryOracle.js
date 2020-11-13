const {delay} = require('./utils');
const networks = require("../networks");
const DepositaryOracle = artifacts.require("oracle/DepositaryOracle");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(DepositaryOracle, {
    from: Governor.address,
  });

  if (network !== 'development') await delay(30000);
};
