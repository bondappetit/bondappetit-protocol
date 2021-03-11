const {migration} = require("../../../utils/deploy");
const dayjs = require("dayjs");

module.exports = migration("Investment", async (d) => {
  const {
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();
  const [gov] = await d.deployed("GovernanceToken");
  const lockDate = dayjs().add(3, "month").unix();
  const govPrice = '2500000'

  await d.deploy("Investment", {
    args: [USDC.address, gov.address, lockDate, govPrice, UniswapV2Router02.address],
  });
});
