const {migration} = require("../../utils/deploy");

module.exports = migration("ProfitDistributor", async (d) => {
  const [ygov, stable] = await d.deployed("YieldEscrow", "StableToken");
  const governor = d.getGovernor().address;
  const blocksPerMinute = 4;
  const dayDuration = blocksPerMinute * 60 * 24;

  await d.deploy("ProfitDistributor3", {
    contract: "ProfitDistributor",
    args: [
      governor,
      dayDuration * 90,
      stable.address,
      ygov.address,
      dayDuration * 83,
      dayDuration * 7,
    ],
  });
  await d.deploy("ProfitDistributor6", {
    contract: "ProfitDistributor",
    args: [
      governor,
      dayDuration * 182,
      stable.address,
      ygov.address,
      dayDuration * 175,
      dayDuration * 7,
    ],
  });
  await d.deploy("ProfitDistributor12", {
    contract: "ProfitDistributor",
    args: [
      governor,
      dayDuration * 365,
      stable.address,
      ygov.address,
      dayDuration * 358,
      dayDuration * 7,
    ],
  });
  //if (!d.isDev) {
    await d.toTimelock("ProfitDistributor3");
    await d.toTimelock("ProfitDistributor6");
    await d.toTimelock("ProfitDistributor12");
  //}
});
