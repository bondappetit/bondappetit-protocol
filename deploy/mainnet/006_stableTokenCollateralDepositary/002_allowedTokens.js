const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "StableTokenDepositaryBalanceView.allowToken",
  async (d) => {
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
