const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "StableTokenDepositaryBalanceView.allowToken",
  async (d) => {
    const {
      assets: {USDC},
    } = d.getNetwork();
    const allowedTokens = [USDC.address];

    const currentAllowedTokensSet = new Set(
      await d.call("StableTokenDepositaryBalanceView", "allowedTokens", [])
    );

    await allowedTokens.reduce(async (p, token) => {
      await p;

      if (currentAllowedTokensSet.has(token)) {
        console.log(`Token "${token}" already allowed`);
        return Promise.resolve();
      }

      await d.send("StableTokenDepositaryBalanceView", "allowToken", [token]);
    }, Promise.resolve());
  }
);
