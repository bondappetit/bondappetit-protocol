const {migration} = require("../utils/deploy");

module.exports = migration("CollateralMarket", async (d) => {
  let {
    assets: {USDC, USDN},
  } = d.getNetwork();
  if (!USDN) {
    await d.deploy("USDN", {
      contract: "MockERC20",
      args: ["Neutrino USD", "USDN", "1000000000000000000000000"],
    });
    [USDN] = await d.deployed("USDN");
  }

  const [issuer, treasury, stableTokenDepositaryBalanceView] = await d.deployed(
    "Issuer",
    "Treasury",
    "StableTokenDepositaryBalanceView"
  );
  const allowedTokens = [USDC.address, USDN.address];

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
