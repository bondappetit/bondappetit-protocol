const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("UniswapMarketMaker.changeIncoming", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeIncoming: should change incoming token address", async () => {
    const [instance, abt, bond] = await artifacts.requireAll(
      "UniswapMarketMaker",
      "ABT",
      "Bond"
    );
    const amount = "5";

    await instance.methods
      .changeIncoming(bond._address, governor)
      .send({from: governor});

    await bond.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startOwnerBalance = await bond.methods.balanceOf(governor).call();

    await instance.methods
      .changeIncoming(abt._address, governor)
      .send({from: governor});
    const endMarketMakerBalance = await bond.methods
      .balanceOf(instance._address)
      .call();
    const endOwnerBalance = await bond.methods.balanceOf(governor).call();
    const incoming = await instance.methods.incoming().call();
    assert.equal(incoming, abt._address, "Invalid end incoming token address");
    assert.equal(endMarketMakerBalance, "0", "Invalid end buyback balance");
    assert.equal(
      endOwnerBalance,
      bn(startOwnerBalance).add(bn(amount)).toString(),
      "Invalid end owner balance"
    );
  });

  it("changeIncoming: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("UniswapMarketMaker");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.changeIncoming(notOwner, governor).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
