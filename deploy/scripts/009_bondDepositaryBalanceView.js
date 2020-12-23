const {migration} = require("../utils");

module.exports = migration("BondDepositaryBalanceView", async (d) => {
  const [depositaryOracle, securityOracle] = await d.deployed(
    "DepositaryOracle",
    "SecurityOracle"
  );
  await d.deploy("BondDepositaryBalanceView", {
    args: [depositaryOracle.address, securityOracle.address],
  });
});
