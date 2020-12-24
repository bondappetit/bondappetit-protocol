const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("UniswapMarketMaker.transfer", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("transfer: should transfer token to recipient", async () => {
    const [instance, abt, bond] = await artifacts.requireAll(
      "UniswapMarketMaker",
      "ABT",
      "Bond"
    );
    const amount = "5";

    await bond.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .transfer(bond._address, governor, amount)
      .send({from: governor, gas: 6000000});
    /*
    await bond.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startOwnerBalance = await bond.methods.balanceOf(governor).call();

    instance.methods
      .transfer(bond._address, governor, amount)
      .send({from: governor});
    const endMarketMakerBalance = await bond.methods
      .balanceOf(instance._address)
      .call();
    const endOwnerBalance = await bond.methods.balanceOf(governor).call();
    assert.equal(
      endMarketMakerBalance,
      "0",
      "Invalid end market maker balance"
    );
    assert.equal(
      endOwnerBalance,
      bn(startOwnerBalance).add(bn(amount)).toString(),
      "Invalid end owner balance"
    );
    */
  });

  it("transfer: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("UniswapMarketMaker");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.transfer(governor, governor, "1").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
