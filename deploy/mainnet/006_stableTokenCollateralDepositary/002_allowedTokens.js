const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "StableTokenDepositaryBalanceView.allowToken",
  async (d) => {
    const {
      assets: {USDC, USDN},
    } = d.getNetwork();
    const allowedTokens = [USDC.address, USDN.address];

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
