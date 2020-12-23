const {migration} = require("../utils");

module.exports = migration("Issuer", async (d) => {
  const [abt, treasury, bondDepositaryBalanceView] = await d.deployed(
    "ABT",
    "Treasury",
    "BondDepositaryBalanceView"
  );
  await d.deploy("Issuer", {
    args: [abt.address, treasury.address],
  });
  await d.send("Issuer", "addDepositary", [bondDepositaryBalanceView.address]);
});
