const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("DepositorCollateral.lock", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("lock: should lock collateral", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "DepositorCollateral",
      "GovernanceToken"
    );
    const [, depositor] = artifacts.accounts;
    const firstAmount = "1000";
    const secondAmount = "500";

    const startTotalSupply = await instance.methods
      .totalSupply(gov._address)
      .call();
    const startBalanceDepositor = await instance.methods
      .balanceOf(gov._address, depositor)
      .call();
    const startBalanceContract = await gov.methods
      .balanceOf(instance._address)
      .call();

    await gov.methods.transfer(depositor, firstAmount).send({from: governor});
    await gov.methods
      .approve(instance._address, firstAmount)
      .send({from: depositor});
    await instance.methods
      .lock(gov._address, depositor, firstAmount)
      .send({from: governor, gas: 6000000});
    const [
      middleTotalSupply,
      middleBalanceDepositor,
      middleBalanceContract,
    ] = await Promise.all([
      instance.methods.totalSupply(gov._address).call(),
      instance.methods.balanceOf(gov._address, depositor).call(),
      gov.methods.balanceOf(instance._address).call(),
    ]);
    assert.equal(
      middleTotalSupply,
      bn(startTotalSupply).add(bn(firstAmount)).toString(),
      "Invalid middle total supply"
    );
    assert.equal(
      middleBalanceDepositor,
      bn(startBalanceDepositor).add(bn(firstAmount)).toString(),
      "Invalid middle balance depositor"
    );
    assert.equal(
      middleBalanceContract,
      bn(startBalanceContract).add(bn(firstAmount)).toString(),
      "Invalid middle balance contract"
    );

    await gov.methods.transfer(depositor, secondAmount).send({from: governor});
    await gov.methods
      .approve(instance._address, secondAmount)
      .send({from: depositor});
    await instance.methods
      .lock(gov._address, depositor, secondAmount)
      .send({from: governor, gas: 6000000});
    const [
      endTotalSupply,
      endBalanceDepositor,
      endBalanceContract,
    ] = await Promise.all([
      instance.methods.totalSupply(gov._address).call(),
      instance.methods.balanceOf(gov._address, depositor).call(),
      gov.methods.balanceOf(instance._address).call(),
    ]);
    assert.equal(
      endTotalSupply,
      bn(middleTotalSupply).add(bn(secondAmount)).toString(),
      "Invalid end total supply"
    );
    assert.equal(
      endBalanceDepositor,
      bn(middleBalanceDepositor).add(bn(secondAmount)).toString(),
      "Invalid end balance depositor"
    );
    assert.equal(
      endBalanceContract,
      bn(middleBalanceContract).add(bn(secondAmount)).toString(),
      "Invalid end balance contract"
    );
  });

  it("lock: should revert tx if called is not the owner", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "DepositorCollateral",
      "GovernanceToken"
    );
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods
        .lock(gov._address, governor, "100")
        .send({from: notOwner, gas: 6000000}),
      "Ownable: caller is not the owner"
    );
  });
});
