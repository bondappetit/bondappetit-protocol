const {migration} = require("../utils/deploy");

module.exports = migration("Issuer", async (d) => {
  const [
    stable,
    treasury,
    bondDepositaryBalanceView,
    stableTokenDepositaryBalanceView,
  ] = await d.deployed(
    "StableToken",
    "Treasury",
    "BondDepositaryBalanceView",
    "StableTokenDepositaryBalanceView"
  );
  await d.deploy("Issuer", {
    args: [stable.address, treasury.address],
  });
  await d.send("Issuer", "addDepositary", [bondDepositaryBalanceView.address]);
  await d.send("Issuer", "addDepositary", [
    stableTokenDepositaryBalanceView.address,
  ]);
});
