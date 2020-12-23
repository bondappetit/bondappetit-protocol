const {migration} = require("../utils");

module.exports = migration("Buyback", async (d) => {
  const {
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();

  const [bond, stacking] = await d.deployed("Bond", "Stacking");

  await d.deploy("Buyback", {
    args: [
      USDC.address,
      bond.address,
      stacking.address,
      UniswapV2Router02.address,
    ],
  });
});
