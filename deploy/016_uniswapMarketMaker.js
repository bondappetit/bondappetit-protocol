const {migration} = require("../utils/deploy");

module.exports = migration("UniswapMarketMaker", async (d) => {
  const {
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();

  const [gov] = await d.deployed("GovernanceToken");
  await d.deploy("UniswapMarketMaker", {
    args: [USDC.address, gov.address, UniswapV2Router02.address],
  });
});
