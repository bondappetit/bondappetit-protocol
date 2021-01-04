const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Buyback.changeIncoming", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeIncoming: should change incoming token address", async () => {
    const [instance, bond] = await artifacts.requireAll("Buyback", "Bond");
    const abtAddress = development.contracts.Stable.address;
    const amount = "5";

    await instance.methods
      .changeIncoming(bond._address, governor)
      .send({from: governor});

    await bond.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startOwnerBalance = await bond.methods.balanceOf(governor).call();

    await instance.methods
      .changeIncoming(abtAddress, governor)
      .send({from: governor});
    const endBuybackBalance = await bond.methods
      .balanceOf(instance._address)
      .call();
    const endOwnerBalance = await bond.methods.balanceOf(governor).call();
    const incoming = await instance.methods.incoming().call();
    assert.equal(incoming, abtAddress, "Invalid end incoming token address");
    assert.equal(endBuybackBalance, "0", "Invalid end buyback balance");
    assert.equal(
      endOwnerBalance,
      bn(startOwnerBalance).add(bn(amount)).toString(),
      "Invalid end owner balance"
    );
  });

  it("changeIncoming: should revert tx if sender not owner", async () => {
    const [instance, bond] = await artifacts.requireAll("Buyback", "Bond");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.changeUniswapRouter(bond._address).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
