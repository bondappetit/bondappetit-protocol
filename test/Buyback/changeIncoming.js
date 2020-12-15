const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Buyback = artifacts.require("Buyback");
const Bond = artifacts.require("Bond");
const ABT = artifacts.require("ABT");
const {development} = require("../../networks");

contract("Buyback.changeIncoming", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("changeIncoming: should change incoming token address", async () => {
    const instance = await Buyback.deployed();
    const bond = await Bond.deployed();
    const amount = "5";

    await instance.changeIncoming(Bond.address, governor, {from: governor});

    await bond.transfer(Buyback.address, amount);
    const startOwnerBalance = await bond.balanceOf(governor);

    await instance.changeIncoming(ABT.address, governor, {from: governor});
    const endBuybackBalance = await bond.balanceOf(Buyback.address);
    const endOwnerBalance = await bond.balanceOf(governor);
    const incoming = await instance.incoming();
    assert.equal(incoming, ABT.address, "Invalid end incoming token address");
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

  it("changeIncoming: should revert tx if sender not owner", async () => {
    const instance = await Buyback.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.changeUniswapRouter(Bond.address, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
