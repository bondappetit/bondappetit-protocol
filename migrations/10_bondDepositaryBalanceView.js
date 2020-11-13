const {delay} = require('./utils');
const networks = require("../networks");
const DepositaryOracle = artifacts.require("oracle/DepositaryOracle");
const SecurityOracle = artifacts.require("oracle/SecurityOracle");
const BondDepositaryBalanceView = artifacts.require(
  "oracle/BondDepositaryBalanceView"
);

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(
    BondDepositaryBalanceView,
    DepositaryOracle.address,
    SecurityOracle.address,
    {
      from: Governor.address,
    }
  );

  if (network !== 'development') await delay(30000);
};
