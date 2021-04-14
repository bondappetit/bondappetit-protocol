const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");

contract("Staking.stake", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("stake: should stake token", async () => {
    const [instance, gov] = await artifacts.requireAll("GovStaking", "GovernanceToken");
    const reward = "100000000000000000";
    const amount = "100";

    await gov.methods
      .transfer(instance._address, reward)
      .send({from: governor});
    await instance.methods
      .notifyRewardAmount(reward)
      .send({from: governor, gas: 6000000});

    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods.stake(amount).send({from: governor, gas: 6000000});

    const startBalance = await gov.methods.balanceOf(governor).call();
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block

    await instance.methods.getReward().send({from: governor, gas: 6000000});
    const balanceAfterGetReward = await gov.methods.balanceOf(governor).call();
    assert.equal(
      balanceAfterGetReward > startBalance,
      true,
      "Get reward fail"
    );

    await instance.methods.exit().send({from: governor, gas: 6000000});
    const balanceAfterExit = await gov.methods.balanceOf(governor).call();
    assert.equal(
      balanceAfterExit > balanceAfterGetReward,
      true,
      "Exit fail"
    );
  });
});
