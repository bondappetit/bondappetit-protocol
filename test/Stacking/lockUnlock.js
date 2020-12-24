const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Stacking.lockUnlock", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const decimals = bn(10).pow(bn(18));

  it("lock: should lock tokens", async () => {
    const [instance, bond] = await artifacts.requireAll("Stacking", "Bond");
    const amount = bn(10).pow(bn(18)).toString();

    const currentReward = await instance.methods.rewards(bond._address).call();
    const currentDelta = currentReward.delta;
    assert.notEqual(currentDelta, "0", "Start delta invalid");

    await bond.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods.lock(bond._address, amount).send({from: governor});

    const firstBalance = await instance.methods
      .balances(governor, bond._address)
      .call();
    const firstPrice = await instance.methods.price(bond._address).call();
    const firstReward = await instance.methods.reward(bond._address).call();
    assert.equal(firstBalance.amount, amount, "First amount invalid");
    assert.equal(
      firstBalance.cost,
      bn(firstPrice).mul(bn(amount)).toString(),
      "First cost invalid"
    );
    assert.equal(firstReward, "0", "First reward invalid");

    await bond.methods.transfer(governor, "0").send({from: governor}); // Next block.

    const secondReward = await instance.methods.reward(bond._address).call();
    assert.equal(
      secondReward,
      bn(currentDelta).mul(bn(amount)).div(decimals).toString(),
      "Second reward invalid"
    );

    await bond.methods.transfer(governor, "0").send({from: governor}); // Next block.

    const thirdReward = await instance.methods.reward(bond._address).call();
    assert.equal(
      thirdReward,
      bn(currentDelta)
        .mul(bn(amount).mul(bn(2)))
        .div(bn(decimals))
        .toString(),
      "Third reward invalid"
    );
  });

  it("lock: should add stacking tokens", async () => {
    const [instance, bond] = await artifacts.requireAll("Stacking", "Bond");
    const amount = bn(2)
      .mul(bn(10).pow(bn(16)))
      .toString();

    const {delta} = await instance.methods.rewards(bond._address).call();
    const firstBalance = await instance.methods
      .balances(governor, bond._address)
      .call();
    const firstReward = await instance.methods.reward(bond._address).call();

    await bond.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods.lock(bond._address, amount).send({from: governor});

    const secondBalance = await instance.methods
      .balances(governor, bond._address)
      .call();
    const secondPrice = await instance.methods.price(bond._address).call();
    const secondReward = await instance.methods.reward(bond._address).call();
    assert.equal(
      secondBalance.amount,
      bn(firstBalance.amount).add(bn(amount)).toString(),
      "Second amount invalid"
    );
    assert.equal(
      secondBalance.cost,
      bn(firstBalance.cost)
        .add(bn(amount).mul(bn(secondPrice)))
        .toString(),
      "Second cost invalid"
    );
    assert.equal(
      secondReward,
      bn(firstReward)
        .add(bn(delta).mul(bn(firstBalance.amount)).mul(bn(2)).div(decimals))
        .toString(),
      "Second reward invalid"
    );

    await bond.methods.transfer(governor, "0").send({from: governor}); // Next block.
    const thirdBalance = await instance.methods
      .balances(governor, bond._address)
      .call();
    const thirdReward = await instance.methods.reward(bond._address).call();
    assert.equal(
      thirdBalance.amount,
      secondBalance.amount,
      "Third amount invalid"
    );
    assert.equal(thirdBalance.cost, secondBalance.cost, "Third cost invalid");
    assert.equal(
      thirdReward,
      bn(secondReward)
        .add(bn(delta).mul(bn(firstBalance.amount)).div(decimals))
        .add(bn(delta).mul(bn(amount)).div(decimals))
        .toString(),
      "Third reward invalid"
    );
  });

  it("unlock: should withdraw locked tokens and reward", async () => {
    const [instance, bond] = await artifacts.requireAll("Stacking", "Bond");

    await bond.methods
      .transfer(instance._address, bn(10).pow(bn(18)).toString())
      .send({from: governor});

    const startBondBalance = await bond.methods.balanceOf(governor).call();
    const reward = await instance.methods.reward(bond._address).call();
    const balance = await instance.methods
      .balances(governor, bond._address)
      .call();
    const {delta} = await instance.methods.rewards(bond._address).call();
    const rewardToUnlockBlock = bn(balance.amount)
      .mul(bn(delta))
      .div(bn(10).pow(bn(18)))
      .toString();

    await instance.methods.unlock(bond._address).send({from: governor});

    const endBondBalance = await bond.methods.balanceOf(governor).call();
    assert.equal(
      endBondBalance,
      bn(startBondBalance)
        .add(bn(balance.amount))
        .add(bn(reward))
        .add(bn(rewardToUnlockBlock))
        .toString(),
      "Invalid end bond balance"
    );
  });
});
