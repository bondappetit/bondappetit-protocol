const networks = require("../networks");
const DepositaryOracle = artifacts.require("oracle/DepositaryOracle");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(DepositaryOracle, {
    from: Governor.address,
  });
};
