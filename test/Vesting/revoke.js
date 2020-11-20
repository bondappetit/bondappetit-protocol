
const assertions = require("truffle-assertions");
const Bond = artifacts.require("Bond");
const Vesting = artifacts.require("Vesting");
const {development} = require("../../networks");

contract("Vesting.revoke", (accounts) => {
  const governor = development.accounts.Governor.address;
  const recipient = accounts[1];
  const amount = "100";
  const date = "0";

  it("revoke: should revoke period", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();

    const startBalance = await bond.balanceOf(governor, {from: governor});
    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipient, amount, date, {from: governor});

    const startPeriods = await instance.info(recipient);
    const addedPeriod = startPeriods[startPeriods.length - 1];
    assert.equal(addedPeriod.amount, amount, "Invalid amount");

    await instance.revoke(recipient, addedPeriod.id, {from: governor});

    const endBalance = await bond.balanceOf(governor, {from: governor});
    const endPeriods = await instance.info(recipient);
    const revokedPeriod = endPeriods[endPeriods.length - 1];
    assert.equal(endBalance.toString(), startBalance.toString(), "Reward not returned");
    assert.equal(revokedPeriod.amount, '0', "Reward not reset");
  });

  it("revoke: should revert tx if called is not the owner", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();

    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipient, amount, date, {from: governor});

    const periods = await instance.info(recipient);
    const addedPeriod = periods[periods.length - 1];

    await assertions.reverts(
      instance.revoke(recipient, addedPeriod.id, {from: recipient}),
      "Ownable: caller is not the owner."
    );
  });

  it("revoke: should revert tx if period already withdrawal", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();

    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipient, amount, date, {from: governor});
    const periods = await instance.info(recipient);
    const addedPeriod = periods[periods.length - 1];

    await instance.withdraw(addedPeriod.id, {from: recipient});

    await assertions.reverts(
      instance.revoke(recipient, addedPeriod.id, {from: governor}),
      "Vesting::revoke: already withdraw"
    );
  });
});
