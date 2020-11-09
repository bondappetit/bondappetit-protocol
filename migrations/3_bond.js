const networks = require("../networks");
const Bond = artifacts.require("Bond");
const Timelock = artifacts.require("Timelock");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(
    Bond,
    Governor.address
  );

  const bond = await Bond.deployed();
  if (network !== "development") {
    await bond.transferOwnership(Timelock.address);
  }
};
