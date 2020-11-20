const {afterMigration} = require("./utils");
const networks = require("../networks");
const ABT = artifacts.require("ABT");
const Treasury = artifacts.require("Treasury");
const BondDepositaryBalanceView = artifacts.require(
  "oracle/BondDepositaryBalanceView"
);
const Issuer = artifacts.require("Issuer");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(Issuer, ABT.address, Treasury.address, {
    from: Governor.address,
  });

  const issuer = await Issuer.deployed();
  await issuer.addDepositary(BondDepositaryBalanceView.address);

  await afterMigration(network);
};
