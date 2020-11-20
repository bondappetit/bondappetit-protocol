const assertions = require("truffle-assertions");
const Bond = artifacts.require("Bond");
const Vesting = artifacts.require("Vesting");
const {development} = require("../../networks");

contract("Vesting.lock", (accounts) => {
  const governor = development.accounts.Governor.address;
  const recipient = accounts[1];
  const amount = "100";
  const date = "0";

  it("lock: should lock period", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();

    const startPeriods = await instance.info(recipient);

    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipient, amount, date, {from: governor});

    const endPeriods = await instance.info(recipient);
    assert.equal(
      endPeriods.length,
      startPeriods.length + 1,
      "New period not added"
    );
    const addedPeriod = endPeriods[endPeriods.length - 1];
    assert.equal(addedPeriod.amount, amount, "Invalid amount");
    assert.equal(addedPeriod.date, date, "Invalid date");
    assert.equal(addedPeriod.withdrawal, false, "Invalid withdrawal flag");
  });

  it("lock: should rever tx if amount not approved", async () => {
    const instance = await Vesting.deployed();

    await assertions.reverts(
      instance.lock(recipient, amount, date, {from: governor}),
      "Bond::transferFrom: transfer amount exceeds spender allowance"
    );
  });

  it("lock: should revert tx if called is not the owner", async () => {
    const instance = await Vesting.deployed();

    await assertions.reverts(
      instance.lock(recipient, amount, date, {from: recipient}),
      "Ownable: caller is not the owner."
    );
  });

  it("lock: should revert tx if overflows", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();

    const startPeriods = await instance.info(recipient);
    const maxPeriods = await instance.maxPeriodsPerRecipient();

    for (let i = 0; i < maxPeriods - startPeriods.length; i++) {
      await bond.approve(Vesting.address, amount, {from: governor});
      await instance.lock(recipient, amount, date, {from: governor});
    }

    await bond.approve(Vesting.address, amount, {from: governor});
    await assertions.reverts(
      instance.lock(recipient, amount, date, {from: governor}),
      "Vesting::lock: too many periods"
    );
  });
});
