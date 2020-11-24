const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Bond = artifacts.require("Bond");
const Vesting = artifacts.require("Vesting");
const {development} = require("../../networks");
const dayjs = require('dayjs');

contract("Vesting.withdraw", (accounts) => {
  const governor = development.accounts.Governor.address;
  const recipient = accounts[1];
  const amount = "100";
  const date = "0";

  it("withdraw: should withdraw reward", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();

    const startBalance = await bond.balanceOf(recipient);
    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipient, amount, date, {from: governor});

    const startPeriods = await instance.info(recipient);
    const addedPeriod = startPeriods[startPeriods.length - 1];

    await instance.withdraw(addedPeriod.id, {from: recipient});

    const endBalance = await bond.balanceOf(recipient);
    const endPeriods = await instance.info(recipient);
    const withdrawalPeriod = endPeriods[endPeriods.length - 1];
    assert.equal(
      endBalance.toString(),
      startBalance.add(utils.toBN(amount)).toString(),
      "Invalid balance"
    );
    assert.equal(withdrawalPeriod.withdrawal, true, "Invalid withdrawal flag");
  });

  it("withdraw: should revert tx if period is empty", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();

    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipient, amount, date, {from: governor});

    const periods = await instance.info(recipient);
    const addedPeriod = periods[periods.length - 1];

    await instance.revoke(recipient, addedPeriod.id, {from: governor});

    await assertions.reverts(
      instance.withdraw(addedPeriod.id, {from: recipient}),
      "Vesting::withdraw: period is empty"
    );
  });

  it("withdraw: should revert tx if period is withdrawal", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();

    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipient, amount, date, {from: governor});

    const periods = await instance.info(recipient);
    const addedPeriod = periods[periods.length - 1];

    await instance.withdraw(addedPeriod.id, {from: recipient});

    await assertions.reverts(
      instance.withdraw(addedPeriod.id, {from: recipient}),
      "Vesting::withdraw: already withdraw"
    );
  });

  it("withdraw: should revert tx if period has not come", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();
    const distantFuture = dayjs().add(1, 'year').unix();

    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipient, amount, distantFuture, {from: governor});

    const periods = await instance.info(recipient);
    const addedPeriod = periods[periods.length - 1];

    await assertions.reverts(
      instance.withdraw(addedPeriod.id, {from: recipient}),
      "Vesting::withdraw: access denied"
    );
  });
});
