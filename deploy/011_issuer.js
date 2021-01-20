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

  const [issuer] = await d.deployed("Issuer");
  const {networkName} = d.getNetwork();
  if (networkName === 'development') {
    await d.send("StableToken", "allowAccess", [d.getGovernor().address])
  }
  await d.send("StableToken", "transferOwnership", [issuer.address]);
});
