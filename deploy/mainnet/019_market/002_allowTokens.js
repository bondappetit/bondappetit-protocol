const {migration} = require("../../../utils/deploy");

module.exports = migration("Market.allowToken", async (d) => {
  const {
    assets: {USDC, USDT, DAI, WBTC, WETH},
    contracts: {
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

  await allowedTokens.reduce(async (tx, {address, priceFeed}) => {
    await tx;
    const isAllowed = await d.call("Market", "isAllowedToken", [address]);
    if (isAllowed) {
      console.log(`Token ${address} is already allowed on Market contract`);
      return;
    }

    await d.send("Market", "allowToken", [address, priceFeed]);
  }, Promise.resolve());
});
