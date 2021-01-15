const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Buyback.transfer", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("transfer: should transfer incoming token to recipient", async () => {
    const [instance, gov] = await artifacts.requireAll("Buyback", "GovernanceToken");
    const amount = "5";

    await instance.methods
      .changeIncoming(gov._address, governor)
      .send({from: governor});

    await gov.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startOwnerBalance = await gov.methods.balanceOf(governor).call();

    await instance.methods.transfer(governor, amount).send({from: governor});
    const endBuybackBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const endOwnerBalance = await gov.methods.balanceOf(governor).call();
    assert.equal(endBuybackBalance, "0", "Invalid end buyback balance");
    assert.equal(
      endOwnerBalance,
      bn(startOwnerBalance).add(bn(amount)).toString(),
      "Invalid end owner balance"
    );
  });

  it("transfer: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("Buyback");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.transfer(governor, "1").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
