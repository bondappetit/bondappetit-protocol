const networks = require("../networks");
const Bond = artifacts.require("Bond");
const Timelock = artifacts.require("Timelock");
const GovernorAlpha = artifacts.require("GovernorAlpha");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(
    GovernorAlpha,
    Timelock.address,
    Bond.address,
    Governor.address
  );
};
