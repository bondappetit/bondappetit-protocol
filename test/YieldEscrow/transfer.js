const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("YieldEscrow.depositWithdraw", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const amount = bn(100).mul(bn(1e18)).toString();

  it("transfer: should transfer token for only allowed accounts", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "YieldEscrow",
      "GovernanceToken"
    );
    const [, other] = artifacts.accounts;

    await gov.methods.mint(governor, amount).send({from: governor});
    await gov.methods.approve(instance._address, amount).send({from: governor});
    await instance.methods.deposit(amount).send({from: governor});
    await instance.methods.allowTransfer(other).send({from: governor});

    await instance.methods.transfer(other, amount).send({from: governor});

    const endBalance = await instance.methods.balanceOf(other).call();
    assert.equal(endBalance.toString(), amount, "Invalid end balance");
  });

  it("transferFrom: should transfer token for only allowed accounts", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");
    const [, other] = artifacts.accounts;

    await instance.methods.approve(governor, amount).send({from: other});
    await instance.methods
      .transferFrom(other, governor, amount)
      .send({from: governor});

    const endBalance = await instance.methods.balanceOf(governor).call();
    assert.equal(endBalance.toString(), amount, "Invalid end balance");
  });

  it("transfer: should revert tx if sender or recipient is not allowed", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");
    const [, other] = artifacts.accounts;

    await instance.methods.denyTransfer(other).send({from: governor});

    await assertions.reverts(
      instance.methods.transfer(other, amount).send({from: governor}),
      "YieldEscrow: transfer of tokens is prohibited"
    );
  });

  it("transferFrom: should revert tx if sender or recipient is not allowed", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");
    const [, other] = artifacts.accounts;

    await instance.methods.denyTransfer(other).send({from: governor});

    await assertions.reverts(
      instance.methods
        .transferFrom(other, governor, amount)
        .send({from: governor}),
      "YieldEscrow: transfer of tokens is prohibited"
    );
  });
});
