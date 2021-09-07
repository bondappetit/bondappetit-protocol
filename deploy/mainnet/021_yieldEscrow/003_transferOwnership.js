const {migration} = require("../../../utils/deploy");

module.exports = migration("YieldEscrow.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");
  const [
    profitDistributor3,
    profitDistributor6,
    profitDistributor12,
  ] = await d.deployed(
    "ProfitDistributor3",
    "ProfitDistributor6",
    "ProfitDistributor12"
  );

  await d.send("YieldEscrow", "allowTransfer", [profitDistributor3.address]);
  await d.send("YieldEscrow", "allowTransfer", [profitDistributor6.address]);
  await d.send("YieldEscrow", "allowTransfer", [profitDistributor12.address]);

  await d.send("ProfitDistributor3", "changeRewardsDistribution", [timelock.address]);
  await d.send("ProfitDistributor3", "transferOwnership", [timelock.address]);
  await d.send("ProfitDistributor6", "changeRewardsDistribution", [timelock.address]);
  await d.send("ProfitDistributor6", "transferOwnership", [timelock.address]);
  await d.send("ProfitDistributor12", "changeRewardsDistribution", [timelock.address]);
  await d.send("ProfitDistributor12", "transferOwnership", [timelock.address]);
  await d.send("YieldEscrow", "transferOwnership", [timelock.address]);
});
