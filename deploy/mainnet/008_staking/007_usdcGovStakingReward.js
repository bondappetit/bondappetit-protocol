const {migration, bn} = require("../../../utils/deploy");

module.exports = migration("UsdcGovLPStaking.notifyRewardAmount", async (d) => {
  const [staking] = await d.deployed("UsdcGovLPStaking");
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const currentReward = await d.call("GovernanceToken", "balanceOf", [
    staking.address,
  ]);
  const amount = bn(govTotalSupply).div(bn(10000)).mul(bn(25)).toString(); // 0.25%
  if (currentReward.toString() === amount) {
    console.log("Reward already transfered");
    return;
  }

  await d.send("GovernanceToken", "transfer", [staking.address, amount]);
  await d.send("UsdcGovLPStaking", "notifyRewardAmount", [amount]);
});
