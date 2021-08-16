const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("YieldEscrow.depositWithdraw", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const amount = bn(100).mul(bn(1e18)).toString();

  it("deposit: should get gov token and mint ve token", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "YieldEscrow",
      "GovernanceToken"
    );

    await gov.methods.mint(governor, amount).send({from: governor});
    const startAccountGovBalance = await gov.methods.balanceOf(governor).call();
    const startEscrowGovBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const startAccountVeGovBalance = await instance.methods
      .balanceOf(governor)
      .call();
    const startVeGovTotalSupply = await instance.methods.totalSupply().call();

    await gov.methods.approve(instance._address, amount).send({from: governor});
    await instance.methods.deposit(amount).send({from: governor});

    assert.equal(
      await gov.methods.balanceOf(governor).call(),
      bn(startAccountGovBalance).sub(bn(amount)).toString(),
      "Invalid end account gov token balance"
    );
    assert.equal(
      await gov.methods.balanceOf(instance._address).call(),
      bn(startEscrowGovBalance).add(bn(amount)).toString(),
      "Invalid end escrow gov token balance"
    );
    assert.equal(
      await instance.methods.balanceOf(governor).call(),
      bn(startAccountVeGovBalance).add(bn(amount)).toString(),
      "Invalid end vegov token balance"
    );
    assert.equal(
      await instance.methods.totalSupply().call(),
      bn(startVeGovTotalSupply).add(bn(amount)).toString(),
      "Invalid end vegov token total supply"
    );
  });

  it("withdraw: should get ve token and return gov token", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "YieldEscrow",
      "GovernanceToken"
    );

    const startAccountGovBalance = await gov.methods.balanceOf(governor).call();
    const startEscrowGovBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const startAccountVeGovBalance = await instance.methods
      .balanceOf(governor)
      .call();
    const startVeGovTotalSupply = await instance.methods.totalSupply().call();

    await instance.methods.withdraw(amount).send({from: governor});

    assert.equal(
      await gov.methods.balanceOf(governor).call(),
      bn(startAccountGovBalance).add(bn(amount)).toString(),
      "Invalid end account gov token balance"
    );
    assert.equal(
      await gov.methods.balanceOf(instance._address).call(),
      bn(startEscrowGovBalance).sub(bn(amount)).toString(),
      "Invalid end escrow gov token balance"
    );
    assert.equal(
      await instance.methods.balanceOf(governor).call(),
      bn(startAccountVeGovBalance).sub(bn(amount)).toString(),
      "Invalid end vegov token balance"
    );
    assert.equal(
      await instance.methods.totalSupply().call(),
      bn(startVeGovTotalSupply).sub(bn(amount)).toString(),
      "Invalid end vegov token total supply"
    );
  });

  it("deposit: should revert tx if amount negative or zero", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");

    await assertions.reverts(
      instance.methods.deposit(0).send({from: governor}),
      "YieldEscrow::deposit: negative or zero amount"
    );
  });

  it("withdraw: should revert tx if amount negative or zero", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");

    await assertions.reverts(
      instance.methods.withdraw(0).send({from: governor}),
      "YieldEscrow::withdraw: negative or zero amount"
    );
  });

  it("deposit: should revert tx if vote delegator already created", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");

    await instance.methods.createVoteDelegator().send({from: governor, gas: 6000000});

    await assertions.reverts(
      instance.methods.deposit(1).send({from: governor}),
      "YieldEscrow::deposit: vote delegator only deposit for this account"
    );
  });

  it("withdraw: should revert tx if vote delegator already created", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");

    await assertions.reverts(
      instance.methods.withdraw(1).send({from: governor}),
      "YieldEscrow::withdraw: vote delegator only deposit for this account"
    );
  });
});
