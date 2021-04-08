const {migration} = require("../../utils/deploy");

module.exports = migration("CollateralMarket", async (d) => {
  let {
    assets: {USDC},
  } = d.getNetwork();

  const [issuer, treasury, stableTokenDepositaryBalanceView] = await d.deployed(
    "Issuer",
    "Treasury",
    "StableTokenDepositaryBalanceView"
  );
  const allowedTokens = [USDC.address];

  await d.deploy("CollateralMarket", {
    args: [
      issuer.address,
      treasury.address,
      stableTokenDepositaryBalanceView.address,
    ],
  });

  await allowedTokens.reduce(async (p, token) => {
    await p;
    await d.send("CollateralMarket", "allowToken", [token]);
  }, Promise.resolve());

  const [collateralMarket] = await d.deployed("CollateralMarket");
  await d.send("Treasury", "allowAccess", [collateralMarket.address]);
});
