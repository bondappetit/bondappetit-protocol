const {delay} = require('./utils');
const networks = require("../networks");
const ABT = artifacts.require("ABT");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(ABT, 0, {
    from: Governor.address,
  });

  if (network !== 'development') await delay(30000);
};
