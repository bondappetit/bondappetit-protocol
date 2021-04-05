const {migration, bn} = require("../../../utils/deploy");

module.exports = migration(
  "UsdcStableLPLockStaking.notifyRewardAmount",
  async (d) => {
    const [staking] = await d.deployed("UsdcStableLPLockStaking");
    const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
    const currentReward = await d.call("GovernanceToken", "balanceOf", [
      staking.address,
    ]);
    const amount = bn(govTotalSupply).div(bn(1000)).mul(bn(50)).toString(); // 5%
    if (currentReward.toString() === amount) {
      console.log("Reward already transfered");
      return;
    }

    await d.send("GovernanceToken", "transfer", [staking.address, amount]);
    await d.send("UsdcStableLPLockStaking", "notifyRewardAmount", [amount]);
  }
);
