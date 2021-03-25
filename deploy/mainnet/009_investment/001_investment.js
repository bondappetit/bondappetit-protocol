const {migration} = require("../../../utils/deploy");
const dayjs = require("dayjs");

module.exports = migration("Investment", async (d) => {
  const {
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();
  const [gov] = await d.deployed("GovernanceToken");
  const lockDate = dayjs("2021-10-01T03:00:00.000Z").unix();
  const govPrice = '2500000'

  await d.deploy("Investment", {
    args: [USDC.address, gov.address, lockDate, govPrice, UniswapV2Router02.address],
  });
});
