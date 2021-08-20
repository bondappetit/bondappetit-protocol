const {migration} = require("../../utils/deploy");

module.exports = migration("UniV2BuybackDepositaryBalanceView", async (d) => {
  let {
    accounts: {Governor},
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();
  const [issuer] = await d.deployed("Issuer");

  await d.deploy("UniV2BuybackDepositaryBalanceView", {
    args: [
      USDC.address,
      issuer.address,
      UniswapV2Router02.address,
      Governor.address,
    ],
  });
  if (!d.isDev) {
    await d.toTimelock("UniV2BuybackDepositaryBalanceView");
  }
});
