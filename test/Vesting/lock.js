const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Vesting.lock", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const amount = "100";
  const date = "0";

  it("lock: should lock period", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, recipient] = artifacts.accounts;

    const startPeriods = await instance.methods.info(recipient).call();

    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods.lock(recipient, amount, date).send({from: governor, gas: 6000000});

    const endPeriods = await instance.methods.info(recipient).call();
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
    const instance = await artifacts.require("Vesting");

    await assertions.reverts(
      instance.methods.lock(governor, amount, date).send({from: governor, gas: 6000000}),
      "GovernanceToken::transferFrom: transfer amount exceeds spender allowance"
    );
  });

  it("lock: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Vesting");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.lock(governor, amount, date).send({from: notOwner, gas: 6000000}),
      "Ownable: caller is not the owner"
    );
  });

  it("lock: should revert tx if overflows", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, recipient] = artifacts.accounts;

    const startPeriods = await instance.methods.info(recipient).call();
    const maxPeriods = await instance.methods.maxPeriodsPerRecipient().call();

    for (let i = 0; i < maxPeriods - startPeriods.length; i++) {
      await gov.methods
        .approve(instance._address, amount)
        .send({from: governor});
      await instance.methods
        .lock(recipient, amount, date)
        .send({from: governor, gas: 6000000});
    }

    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await assertions.reverts(
      instance.methods.lock(recipient, amount, date).send({from: governor, gas: 6000000}),
      "Vesting::lock: too many periods"
    );
  });
});
