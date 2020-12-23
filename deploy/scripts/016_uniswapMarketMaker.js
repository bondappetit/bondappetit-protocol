const {migration} = require("../utils");

module.exports = migration("UniswapMarketMaker", async (d) => {
  const {
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();

  const [bond] = await d.deployed("Bond");
  await d.deploy("UniswapMarketMaker", {
    args: [USDC.address, bond.address, UniswapV2Router02.address],
  });
});
