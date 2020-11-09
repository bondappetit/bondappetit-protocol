const networks = require("../networks");
const DepositaryOracle = artifacts.require("DepositaryOracle");
const Timelock = artifacts.require("Timelock");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(DepositaryOracle, 10, false, {
    from: Governor.address,
  });

  const depositaryOracle = await DepositaryOracle.deployed();
  await depositaryOracle.setAllowUpdateAccount(Governor.address, true, {
    from: Governor.address,
  });
  if (network !== "development") {
    await depositaryOracle.transferOwnership(Timelock.address);
  }
};
