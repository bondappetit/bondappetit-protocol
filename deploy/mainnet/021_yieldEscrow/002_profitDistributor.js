const {migration} = require("../../utils/deploy");

module.exports = migration("ProfitDistributor", async (d) => {
  const {
    assets: {USDC},
  } = d.getNetwork();
  const [ygov] = await d.deployed("YieldEscrow");
  const governor = d.getGovernor().address;
  const blocksPerMinute = 60 / d.getNetwork().averageBlockTime;
  const dayDuration = Math.floor(blocksPerMinute * 60 * 24);

  await d.deploy("ProfitDistributor3", {
    contract: "ProfitDistributor",
    args: [
      governor,
      dayDuration * 90,
      USDC.address,
      ygov.address,
      dayDuration * 83,
      dayDuration * 7,
    ],
  });
  await d.deploy("ProfitDistributor6", {
    contract: "ProfitDistributor",
    args: [
      governor,
      dayDuration * 90,
      USDC.address,
      ygov.address,
      dayDuration * 175,
      dayDuration * 7,
    ],
  });
  await d.deploy("ProfitDistributor12", {
    contract: "ProfitDistributor",
    args: [
      governor,
      dayDuration * 90,
      USDC.address,
      ygov.address,
      dayDuration * 358,
      dayDuration * 7,
    ],
  });
});
