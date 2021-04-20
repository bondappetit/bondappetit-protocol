const {migration} = require("../../utils/deploy");

module.exports = migration("Market", async (d) => {
  const {
    assets: {USDC, WETH},
    contracts: {UniswapV2Router02, UsdcUsdPriceFeed, BnbUsdPriceFeed},
  } = d.getNetwork();
  const allowedTokens = [
    {address: USDC.address, priceFeed: [UsdcUsdPriceFeed.address]},
    {address: WETH.address, priceFeed: [BnbUsdPriceFeed.address]},
  ];

  const [stable, gov] = await d.deployed("StableToken", "GovernanceToken");
  await d.deploy("Market", {
    args: [
      USDC.address,
      stable.address,
      gov.address,
      UniswapV2Router02.address,
      [UsdcUsdPriceFeed.address],
    ],
  });

  await allowedTokens.reduce(async (tx, {address, priceFeed}) => {
    await tx;
    await d.send("Market", "allowToken", [address, priceFeed]);
  }, Promise.resolve());
});
