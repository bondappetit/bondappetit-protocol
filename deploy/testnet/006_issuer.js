const {migration} = require("../../utils/deploy");

module.exports = migration("Issuer", async (d) => {
  const [
    stable,
    treasury,
    realAssetDepositaryBalanceView,
    stableTokenDepositaryBalanceView,
  ] = await d.deployed(
    "StableToken",
    "Treasury",
    "RealAssetDepositaryBalanceView",
    "StableTokenDepositaryBalanceView"
  );
  await d.deploy("Issuer", {
    args: [stable.address, treasury.address],
  });
  await d.send("Issuer", "addDepositary", [
    realAssetDepositaryBalanceView.address,
  ]);
  await d.send("Issuer", "addDepositary", [
    stableTokenDepositaryBalanceView.address,
  ]);

  const [issuer] = await d.deployed("Issuer");
  if (d.isDev) {
    await d.send("StableToken", "allowAccess", [d.getGovernor().address]);
  }
  await d.send("StableToken", "transferOwnership", [issuer.address]);
});
