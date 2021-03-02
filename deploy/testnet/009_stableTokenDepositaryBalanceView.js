const {migration} = require("../../utils/deploy");

module.exports = migration("StableTokenDepositaryBalanceView", async (d) => {
  const {
    assets: {USDC, USDN},
  } = d.getNetwork();
  const allowedTokens = [USDC.address, USDN.address];

  await d.deploy("StableTokenDepositaryBalanceView", {});
  await allowedTokens.reduce(async (p, token) => {
    await p;
    await d.send("StableTokenDepositaryBalanceView", "allowToken", [token]);
  }, Promise.resolve());
});
