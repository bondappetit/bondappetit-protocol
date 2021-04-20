const {migration} = require("../../utils/deploy");

module.exports = migration("Buyback", async (d) => {
  const {
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();

  const [gov, treasury] = await d.deployed("GovernanceToken", "Treasury");

  await d.deploy("Buyback", {
    args: [
      USDC.address,
      gov.address,
      treasury.address,
      UniswapV2Router02.address,
    ],
  });
});
