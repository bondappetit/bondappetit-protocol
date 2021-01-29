const {migration} = require("../../../utils/deploy");

module.exports = migration("CollateralMarket", async (d) => {
  const [issuer, treasury, stableTokenDepositaryBalanceView] = await d.deployed(
    "Issuer",
    "Treasury",
    "StableTokenDepositaryBalanceView"
  );

  await d.deploy("CollateralMarket", {
    args: [
      issuer.address,
      treasury.address,
      stableTokenDepositaryBalanceView.address,
    ],
  });
});
