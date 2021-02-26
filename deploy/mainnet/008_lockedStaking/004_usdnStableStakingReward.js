const {migration, bn} = require("../../../utils/deploy");

module.exports = migration(
  "UsdnStableLPLockStaking.notifyRewardAmount",
  async (d) => {
    const [staking] = await d.deployed("UsdnStableLPLockStaking");
    const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
    const currentReward = await d.call("GovernanceToken", "balanceOf", [
      staking.address,
    ]);
    const amount = bn(govTotalSupply).div(bn(100)).toString(); // 1%
    if (currentReward.toString() === amount) {
      console.log("Reward already transfered");
      return;
    }

    await d.send("GovernanceToken", "transfer", [staking.address, amount]);
    await d.send("UsdnStableLPLockStaking", "notifyRewardAmount", [
      amount,
    ]);
  }
);