const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("DepositorCollateral.withdraw", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("withdraw: should withdraw collateral", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "DepositorCollateral",
      "GovernanceToken"
    );
    const [, depositor] = artifacts.accounts;
    const amount = "1000";

    await gov.methods.transfer(depositor, amount).send({from: governor});
    await gov.methods
      .approve(instance._address, amount)
      .send({from: depositor});
    await instance.methods
      .lock(gov._address, depositor, amount)
      .send({from: governor, gas: 6000000});
    const [
      startTotalSupply,
      startBalanceDepositor,
      startBalanceContract,
      startDepositors,
    ] = await Promise.all([
      instance.methods.totalSupply(gov._address).call(),
      instance.methods.balanceOf(gov._address, depositor).call(),
      gov.methods.balanceOf(instance._address).call(),
      instance.methods.getDepositors(gov._address).call(),
    ]);
    assert.equal(
      startDepositors.includes(depositor),
      true,
      "Invalid start depositors"
    );

    await instance.methods
      .withdraw(gov._address, depositor, amount)
      .send({from: governor, gas: 6000000});

    const [
      endTotalSupply,
      endBalanceDepositor,
      endBalanceContract,
      endDepositors,
    ] = await Promise.all([
      instance.methods.totalSupply(gov._address).call(),
      instance.methods.balanceOf(gov._address, depositor).call(),
      gov.methods.balanceOf(instance._address).call(),
      instance.methods.getDepositors(gov._address).call(),
    ]);
    assert.equal(
      endTotalSupply,
      bn(startTotalSupply).sub(bn(amount)).toString(),
      "Invalid end total supply"
    );
    assert.equal(
      endBalanceDepositor,
      bn(startBalanceDepositor).sub(bn(amount)).toString(),
      "Invalid end balance depositor"
    );
    assert.equal(
      endBalanceContract,
      bn(startBalanceContract).sub(bn(amount)).toString(),
      "Invalid end balance contract"
    );
    assert.equal(
      endDepositors.includes(depositor),
      false,
      "Invalid end depositors"
    );
  });

  it("withdraw: should revert tx if amount eq zero", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "DepositorCollateral",
      "GovernanceToken"
    );
    await assertions.reverts(
      instance.methods
        .withdraw(gov._address, governor, "0")
        .send({from: governor, gas: 6000000}),
      "DepositorCollateral::withdraw: empty amount"
    );
  });

  it("withdraw: should revert tx if balance negative", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "DepositorCollateral",
      "GovernanceToken"
    );
    await assertions.reverts(
      instance.methods
        .withdraw(gov._address, governor, "100")
        .send({from: governor, gas: 6000000}),
      "DepositorCollateral::withdraw: negative balance"
    );
  });

  it("withdraw: should revert tx if called is not the owner", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "DepositorCollateral",
      "GovernanceToken"
    );
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods
        .withdraw(gov._address, governor, "100")
        .send({from: notOwner, gas: 6000000}),
      "Ownable: caller is not the owner"
    );
  });
});
