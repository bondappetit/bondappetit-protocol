const {migration} = require("../../../utils/deploy");

module.exports = migration("CollateralMarket.allowToken", async (d) => {
  const {
    assets: {USDC, USDN},
  } = d.getNetwork();
  const allowedTokens = [USDC.address, USDN.address];

  const currentAllowedTokensSet = new Set(
    await d.call("CollateralMarket", "allowedTokens", [])
  );

  await allowedTokens.reduce(async (p, token) => {
    await p;

    if (currentAllowedTokensSet.has(token)) {
      console.log(`Token "${token}" already allowed`);
      return Promise.resolve();
    }

    await d.send("CollateralMarket", "allowToken", [token]);
  }, Promise.resolve());
});
