const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Staking.notifyRewardAmount", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("notifyRewardAmount: should change reward of stacking token", async () => {
    const [instance, gov] = await artifacts.requireAll("GovStaking", "GovernanceToken");
    const amount = "1000000";

    await gov.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .notifyRewardAmount(amount)
      .send({from: governor, gas: 6000000});

    const endRewardRate = await instance.methods.rewardRate().call();
    assert.equal(
      endRewardRate,
      '6',
      "Invalid reward rate"
    );
  });

  it("notifyRewardAmount: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("GovStaking");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.notifyRewardAmount("1").send({from: notOwner}),
      "Staking::notifyRewardAmount: caller is not RewardsDistribution or Owner address"
    );
  });
});
