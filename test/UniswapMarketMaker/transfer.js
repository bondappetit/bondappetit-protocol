const assertions = require("truffle-assertions");
const {utils} = require("web3");
const UniswapMarketMaker = artifacts.require("UniswapMarketMaker");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("UniswapMarketMaker.transfer", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("transfer: should transfer token to recipient", async () => {
    const instance = await UniswapMarketMaker.deployed();
    const bond = await Bond.deployed();
    const amount = "5";

    await bond.transfer(UniswapMarketMaker.address, amount);
    const startOwnerBalance = await bond.balanceOf(governor);

    await instance.transfer(Bond.address, governor, amount, {from: governor});
    const endMarketMakerBalance = await bond.balanceOf(UniswapMarketMaker.address);
    const endOwnerBalance = await bond.balanceOf(governor);
    assert.equal(
      endMarketMakerBalance.toString(),
      "0",
      "Invalid end market maker balance"
    );
    assert.equal(
      endOwnerBalance.toString(),
      startOwnerBalance.add(utils.toBN(amount)).toString(),
      "Invalid end owner balance"
    );
  });

  it("transfer: should revert tx if sender not owner", async () => {
    const instance = await UniswapMarketMaker.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.transfer(Bond.address, governor, '1', {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
