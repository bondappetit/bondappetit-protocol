const {utils} = require("web3");
const Bond = artifacts.require("Bond");
const Stacking = artifacts.require("Stacking");
const {development} = require("../../networks");

contract("Stacking.lockUnlock", (accounts) => {
  const governor = development.accounts.Governor.address;
  const decimals = utils.toBN(10).pow(utils.toBN(18));

  it("lock: should lock tokens", async () => {
    const instance = await Stacking.deployed();
    const bond = await Bond.deployed();
    const amount = utils.toBN(10).pow(utils.toBN(18));

    const currentReward = await instance.rewards(Bond.address);
    const currentDelta = currentReward.delta.toString();
    assert.notEqual(currentDelta, "0", "Start delta invalid");

    await bond.approve(Stacking.address, amount, {from: governor});
    await instance.lock(Bond.address, amount, {from: governor});

    const firstBalance = await instance.balances(governor, Bond.address);
    const firstPrice = await instance.price(Bond.address);
    const firstReward = await instance.reward(Bond.address);
    assert.equal(
      firstBalance.amount.toString(),
      amount,
      "First amount invalid"
    );
    assert.equal(
      firstBalance.cost.toString(),
      firstPrice.mul(utils.toBN(amount)).toString(),
      "First cost invalid"
    );
    assert.equal(firstReward.toString(), "0", "First reward invalid");

    await bond.transfer(governor, "0", {from: governor}); // Next block.

    const secondReward = await instance.reward(Bond.address);
    assert.equal(
      secondReward.toString(),
      utils.toBN(currentDelta).mul(utils.toBN(amount)).div(decimals),
      "Second reward invalid"
    );

    await bond.transfer(governor, "0", {from: governor}); // Next block.

    const thirdReward = await instance.reward(Bond.address);
    assert.equal(
      thirdReward.toString(),
      utils
        .toBN(currentDelta)
        .mul(utils.toBN(amount).mul(utils.toBN(2)))
        .div(decimals),
      "Third reward invalid"
    );
  });

  it("lock: should add stacking tokens", async () => {
    const instance = await Stacking.deployed();
    const bond = await Bond.deployed();
    const amount = utils.toBN(2).mul(utils.toBN(10).pow(utils.toBN(16)));

    const {delta} = await instance.rewards(Bond.address);
    const firstBalance = await instance.balances(governor, Bond.address);
    const firstReward = await instance.reward(Bond.address);

    await bond.approve(Stacking.address, amount, {from: governor});
    await instance.lock(Bond.address, amount, {from: governor});

    const secondBalance = await instance.balances(governor, Bond.address);
    const secondPrice = await instance.price(Bond.address);
    const secondReward = await instance.reward(Bond.address);
    assert.equal(
      secondBalance.amount.toString(),
      firstBalance.amount.add(utils.toBN(amount)),
      "Second amount invalid"
    );
    assert.equal(
      secondBalance.cost.toString(),
      firstBalance.cost.add(utils.toBN(amount).mul(secondPrice)),
      "Second cost invalid"
    );
    assert.equal(
      secondReward.toString(),
      firstReward
        .add(delta.mul(firstBalance.amount).mul(utils.toBN(2)).div(decimals))
        .toString(),
      "Second reward invalid"
    );

    await bond.transfer(governor, "0", {from: governor}); // Next block.
    const thirdBalance = await instance.balances(governor, Bond.address);
    const thirdReward = await instance.reward(Bond.address);
    assert.equal(
      thirdBalance.amount.toString(),
      secondBalance.amount.toString(),
      "Third amount invalid"
    );
    assert.equal(
      thirdBalance.cost.toString(),
      secondBalance.cost.toString(),
      "Third cost invalid"
    );
    assert.equal(
      thirdReward.toString(),
      secondReward
        .add(delta.mul(firstBalance.amount).div(decimals))
        .add(delta.mul(utils.toBN(amount)).div(decimals))
        .toString(),
      "Third reward invalid"
    );
  });

  it("unlock: should withdraw locked tokens and reward", async () => {
    const instance = await Stacking.deployed();
    const bond = await Bond.deployed();

    await bond.transfer(Stacking.address, utils.toBN(10).pow(utils.toBN(18)).toString(), {from: governor});

    const startBondBalance = await bond.balanceOf(governor);
    const reward = await instance.reward(Bond.address, {from: governor});
    const balance = await instance.balances(governor, Bond.address);
    const {delta} = await instance.rewards(Bond.address);
    const rewardToUnlockBlock = balance.amount.mul(delta).div(utils.toBN(10).pow(utils.toBN(18)));

    await instance.unlock(Bond.address, {from: governor});

    const endBondBalance = await bond.balanceOf(governor);
    assert.equal(
      endBondBalance.toString(),
      startBondBalance.add(balance.amount).add(reward).add(rewardToUnlockBlock).toString(),
      "Invalid end bond balance"
    );
  });
});
