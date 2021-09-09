const {migration} = require("../../../utils/deploy");

module.exports = migration("Market", async (d) => {
  const {
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();
  const [stable, gov] = await d.deployed("StableToken", "GovernanceToken");

  await d.deploy("Market", {
    args: [
      USDC.address,
      stable.address,
      gov.address,
      UniswapV2Router02.address,
    ],
  });
});
