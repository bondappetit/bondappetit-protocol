const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Staking.stake", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("stake: should stake token", async () => {
    const [instance, bond] = await artifacts.requireAll("GovStaking", "Bond");
    const reward = "100000000000000000";
    const amount = "100";

    await bond.methods
      .transfer(instance._address, reward)
      .send({from: governor});
    await instance.methods
      .notifyRewardAmount(reward)
      .send({from: governor, gas: 6000000});

    await bond.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods.stake(amount).send({from: governor, gas: 6000000});

    const startBalance = await bond.methods.balanceOf(governor).call();
    await bond.methods.transfer(governor, '0').send({from: governor}); // next block
    await bond.methods.transfer(governor, '0').send({from: governor}); // next block
    await bond.methods.transfer(governor, '0').send({from: governor}); // next block
    await bond.methods.transfer(governor, '0').send({from: governor}); // next block
    await bond.methods.transfer(governor, '0').send({from: governor}); // next block

    await instance.methods.getReward().send({from: governor, gas: 6000000});
    const balanceAfterGetReward = await bond.methods.balanceOf(governor).call();
    assert.equal(
      balanceAfterGetReward > startBalance,
      true,
      "Get reward fail"
    );

    await instance.methods.exit().send({from: governor, gas: 6000000});
    const balanceAfterExit = await bond.methods.balanceOf(governor).call();
    assert.equal(
      balanceAfterExit > balanceAfterGetReward,
      true,
      "Exit fail"
    );
  });
});
