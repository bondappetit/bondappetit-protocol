const {migration} = require("../utils/deploy");

module.exports = migration("Market", async (d) => {
  const {
    assets: {USDC, USDT, DAI, WBTC, WETH},
    contracts: {UniswapV2Router02, UniswapAnchoredView},
  } = d.getNetwork();
  const allowedTokens = [
    {address: USDT.address, symbol: USDT.symbol},
    {address: USDC.address, symbol: USDC.symbol},
    {address: DAI.address, symbol: DAI.symbol},
    {address: WBTC.address, symbol: "BTC"},
    {address: WETH.address, symbol: "ETH"},
  ];

  const [stable, gov] = await d.deployed("StableToken", "GovernanceToken");
  await d.deploy("Market", {
    args: [
      USDC.address,
      stable.address,
      gov.address,
      UniswapV2Router02.address,
      UniswapAnchoredView.address,
    ],
  });

  await allowedTokens.reduce(async (tx, {address, symbol}) => {
    await tx;
    await d.send("Market", "allowToken", [address, symbol]);
  }, Promise.resolve());
});
