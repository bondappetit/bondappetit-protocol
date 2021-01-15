const {migration} = require("../utils/deploy");

module.exports = migration("Issuer", async (d) => {
  const [stable, treasury, bondDepositaryBalanceView] = await d.deployed(
    "StableToken",
    "Treasury",
    "BondDepositaryBalanceView"
  );
  await d.deploy("Issuer", {
    args: [stable.address, treasury.address],
  });
  await d.send("Issuer", "addDepositary", [bondDepositaryBalanceView.address]);
});
