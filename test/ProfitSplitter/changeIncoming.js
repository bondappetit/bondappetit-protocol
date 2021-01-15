const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("ProfitSplitter.changeIncoming", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeIncoming: should change incoming token address", async () => {
    const [instance, gov, stable] = await artifacts.requireAll(
      "ProfitSplitter",
      "GovernanceToken",
      "StableToken"
    );
    const amount = "5";

    await instance.methods
      .changeIncoming(gov._address, governor)
      .send({from: governor});

    await gov.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startOwnerBalance = await gov.methods.balanceOf(governor).call();

    await instance.methods
      .changeIncoming(stable._address, governor)
      .send({from: governor});
    const endMarketMakerBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const endOwnerBalance = await gov.methods.balanceOf(governor).call();
    const incoming = await instance.methods.incoming().call();
    assert.equal(incoming, stable._address, "Invalid end incoming token address");
    assert.equal(endMarketMakerBalance, "0", "Invalid end buyback balance");
    assert.equal(
      endOwnerBalance,
      bn(startOwnerBalance).add(bn(amount)).toString(),
      "Invalid end owner balance"
    );
  });

  it("changeIncoming: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("ProfitSplitter");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeIncoming(notOwner, governor).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
