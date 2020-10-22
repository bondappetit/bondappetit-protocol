const networks = require("../networks");
const SafeMath = artifacts.require("SafeMath");
const Timelock = artifacts.require("Timelock");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(SafeMath);
  await deployer.link(SafeMath, Timelock);
  await deployer.deploy(
    Timelock,
    Governor.address,
    2 * 24 * 60 * 60 // 2 days delay
  );
};
