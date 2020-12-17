const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Buyback = artifacts.require("Buyback");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("Buyback.transfer", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("transfer: should transfer incoming token to recipient", async () => {
    const instance = await Buyback.deployed();
    const bond = await Bond.deployed();
    const amount = "5";

    await instance.changeIncoming(Bond.address, governor, {from: governor});

    await bond.transfer(Buyback.address, amount);
    const startOwnerBalance = await bond.balanceOf(governor);

    await instance.transfer(governor, amount, {from: governor});
    const endBuybackBalance = await bond.balanceOf(Buyback.address);
    const endOwnerBalance = await bond.balanceOf(governor);
    assert.equal(
      endBuybackBalance.toString(),
      "0",
      "Invalid end buyback balance"
    );
    assert.equal(
      endOwnerBalance.toString(),
      startOwnerBalance.add(utils.toBN(amount)).toString(),
      "Invalid end owner balance"
    );
  });

  it("transfer: should revert tx if sender not owner", async () => {
    const instance = await Buyback.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.transfer(governor, '1', {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
