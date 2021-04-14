const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const dayjs = require("dayjs");

contract("Vesting.withdraw", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const amount = "100";
  const description = "test";
  const date = "0";

  it("withdraw: should withdraw reward", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, recipient] = artifacts.accounts;

    const startBalance = await gov.methods.balanceOf(recipient).call();
    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .lock(recipient, amount, description, date)
      .send({from: governor, gas: 6000000});

    const startPeriods = await instance.methods.info(recipient).call();
    const addedPeriod = startPeriods[startPeriods.length - 1];

    await instance.methods
      .withdraw(addedPeriod.id)
      .send({from: recipient, gas: 6000000});

    const endBalance = await gov.methods.balanceOf(recipient).call();
    const endPeriods = await instance.methods.info(recipient).call();
    const withdrawalPeriod = endPeriods[endPeriods.length - 1];
    assert.equal(
      endBalance,
      bn(startBalance).add(bn(amount)).toString(),
      "Invalid balance"
    );
    assert.equal(withdrawalPeriod.withdrawal, true, "Invalid withdrawal flag");
  });

  it("withdraw: should revert tx if period is empty", async () => {
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
      .revoke(recipient, addedPeriod.id)
      .send({from: governor, gas: 6000000});

    await assertions.reverts(
      instance.methods
        .withdraw(addedPeriod.id)
        .send({from: recipient, gas: 6000000}),
      "Vesting::withdraw: period is empty"
    );
  });

  it("withdraw: should revert tx if period is withdrawal", async () => {
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
        .withdraw(addedPeriod.id)
        .send({from: recipient, gas: 6000000}),
      "Vesting::withdraw: already withdraw"
    );
  });

  it("withdraw: should revert tx if period has not come", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, recipient] = artifacts.accounts;
    const distantFuture = dayjs().add(1, "year").unix();

    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .lock(recipient, amount, description, distantFuture)
      .send({from: governor, gas: 6000000});

    const periods = await instance.methods.info(recipient).call();
    const addedPeriod = periods[periods.length - 1];

    await assertions.reverts(
      instance.methods
        .withdraw(addedPeriod.id)
        .send({from: recipient, gas: 6000000}),
      "Vesting::withdraw: access denied"
    );
  });
});
