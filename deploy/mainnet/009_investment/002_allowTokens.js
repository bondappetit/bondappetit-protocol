const {migration} = require("../../../utils/deploy");

module.exports = migration("Investment.allowToken", async (d) => {
  const {
    assets: {USDC, USDT, DAI, WETH, WBTC, USDN},
  } = d.getNetwork();
  const allowedTokens = [
    USDT.address,
    USDC.address,
    DAI.address,
    WETH.address,
    WBTC.address,
    USDN.address,
  ];

  const currentAllowedTokensSet = new Set(
    await d.call("Investment", "allowedTokens", [])
  );

  await allowedTokens.reduce(async (p, token) => {
    await p;

    if (currentAllowedTokensSet.has(token)) {
      console.log(`Token "${token}" already allowed`);
      return Promise.resolve();
    }

    await d.send("Investment", "allowToken", [token]);
  }, Promise.resolve());
});
