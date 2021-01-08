const {migration} = require("../utils/deploy");

module.exports = migration("Buyback", async (d) => {
  const {
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();

  const [bond, treasury] = await d.deployed("Bond", "Treasury");

  await d.deploy("Buyback", {
    args: [
      USDC.address,
      bond.address,
      treasury.address,
      UniswapV2Router02.address,
    ],
  });
});
