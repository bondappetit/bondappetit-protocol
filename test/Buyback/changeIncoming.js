const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Buyback.changeIncoming", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeIncoming: should change incoming token address", async () => {
    const [instance, gov] = await artifacts.requireAll("Buyback", "GovernanceToken");
    const stableAddress = development.contracts.Stable.address;
    const amount = "5";

    await instance.methods
      .changeIncoming(gov._address, governor)
      .send({from: governor});

    await gov.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startOwnerBalance = await gov.methods.balanceOf(governor).call();

    await instance.methods
      .changeIncoming(stableAddress, governor)
      .send({from: governor});
    const endBuybackBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const endOwnerBalance = await gov.methods.balanceOf(governor).call();
    const incoming = await instance.methods.incoming().call();
    assert.equal(incoming, stableAddress, "Invalid end incoming token address");
    assert.equal(endBuybackBalance, "0", "Invalid end buyback balance");
    assert.equal(
      endOwnerBalance,
      bn(startOwnerBalance).add(bn(amount)).toString(),
      "Invalid end owner balance"
    );
  });

  it("changeIncoming: should revert tx if sender not owner", async () => {
    const [instance, gov] = await artifacts.requireAll("Buyback", "GovernanceToken");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeUniswapRouter(gov._address).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
