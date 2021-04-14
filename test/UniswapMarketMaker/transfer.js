const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");

contract("UniswapMarketMaker.transfer", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("transfer: should transfer token to recipient", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "UniswapMarketMaker",
      "GovernanceToken"
    );
    const amount = "5";

    await gov.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startMarketMakerBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const startOwnerBalance = await gov.methods.balanceOf(governor).call();

    await instance.methods
      .transfer(gov._address, governor, amount)
      .send({from: governor});

    const endMarketMakerBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const endOwnerBalance = await gov.methods.balanceOf(governor).call();
    assert.equal(
      endMarketMakerBalance,
      bn(startMarketMakerBalance).sub(bn(amount)).toString(),
      "Invalid end market maker balance"
    );
    assert.equal(
      endOwnerBalance,
      bn(startOwnerBalance).add(bn(amount)).toString(),
      "Invalid end owner balance"
    );
  });

  it("transfer: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("UniswapMarketMaker");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.transfer(governor, governor, "1").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
