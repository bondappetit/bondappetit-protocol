const {migration} = require("../../utils/deploy");

module.exports = migration("BondDepositaryBalanceView", async (d) => {
  const [depositaryOracle, securityOracle] = await d.deployed(
    "DepositaryOracle",
    "SecurityOracle"
  );
  await d.deploy("BondDepositaryBalanceView", {
    args: [depositaryOracle.address, securityOracle.address],
  });
});
