const {migration} = require("../../utils/deploy");

module.exports = migration("Market", async (d) => {
  const {
    assets: {USDC, USDT, DAI, WBTC, WETH},
    contracts: {
      UniswapV2Router02,
      UsdtUsdPriceFeed,
      UsdcUsdPriceFeed,
      DaiUsdPriceFeed,
      BtcUsdPriceFeed,
      EthUsdPriceFeed,
    },
  } = d.getNetwork();
  const allowedTokens = [
    {address: USDT.address, priceFeed: [UsdtUsdPriceFeed.address]},
    {address: USDC.address, priceFeed: [UsdcUsdPriceFeed.address]},
    {address: DAI.address, priceFeed: [DaiUsdPriceFeed.address]},
    {address: WBTC.address, priceFeed: [BtcUsdPriceFeed.address]},
    {address: WETH.address, priceFeed: [EthUsdPriceFeed.address]},
  ];

  const [stable, gov] = await d.deployed("StableToken", "GovernanceToken");
  await d.deploy("Market", {
    args: [
      USDC.address,
      stable.address,
      gov.address,
      UniswapV2Router02.address,
      [UsdcUsdPriceFeed.address]
    ],
  });

  await allowedTokens.reduce(async (tx, {address, priceFeed}) => {
    await tx;
    await d.send("Market", "allowToken", [address, priceFeed]);
  }, Promise.resolve());
});
