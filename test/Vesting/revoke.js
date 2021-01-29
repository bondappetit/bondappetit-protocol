const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Vesting.revoke", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const amount = "100";
  const description = "test";
  const date = "0";

  it("revoke: should revoke period", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, recipient] = artifacts.accounts;

    const startBalance = await gov.methods.balanceOf(governor).call();
    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .lock(recipient, amount, description, date)
      .send({from: governor, gas: 6000000});

    const startPeriods = await instance.methods.info(recipient).call();
    const addedPeriod = startPeriods[startPeriods.length - 1];
    assert.equal(addedPeriod.amount, amount, "Invalid amount");

    await instance.methods
      .revoke(recipient, addedPeriod.id)
      .send({from: governor, gas: 6000000});

    const endBalance = await gov.methods.balanceOf(governor).call();
    const endPeriods = await instance.methods.info(recipient).call();
    const revokedPeriod = endPeriods[endPeriods.length - 1];
    assert.equal(endBalance, startBalance, "Reward not returned");
    assert.equal(revokedPeriod.amount, "0", "Reward not reset");
  });

  it("revoke: should revert tx if called is not the owner", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, recipient] = artifacts.accounts;

    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .lock(recipient, amount, description, date)
      .send({from: governor, gas: 6000000});

    const periods = await instance.methods.info(recipient).call();
    const addedPeriod = periods[periods.length - 1];

    await assertions.reverts(
      instance.methods
        .revoke(recipient, addedPeriod.id)
        .send({from: recipient, gas: 6000000}),
      "Ownable: caller is not the owner"
    );
  });

  it("revoke: should revert tx if period already withdrawal", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, recipient] = artifacts.accounts;

    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .lock(recipient, amount, description, date)
      .send({from: governor, gas: 6000000});
    const periods = await instance.methods.info(recipient).call();
    const addedPeriod = periods[periods.length - 1];

    await instance.methods
      .withdraw(addedPeriod.id)
      .send({from: recipient, gas: 6000000});

    await assertions.reverts(
      instance.methods
        .revoke(recipient, addedPeriod.id)
        .send({from: governor, gas: 6000000}),
      "Vesting::revoke: already withdraw"
    );
  });
});
