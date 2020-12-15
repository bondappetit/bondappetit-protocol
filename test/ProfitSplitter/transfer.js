const assertions = require("truffle-assertions");
const {utils} = require("web3");
const ProfitSplitter = artifacts.require("ProfitSplitter");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("ProfitSplitter.transfer", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("transfer: should transfer incoming token to recipient", async () => {
    const instance = await ProfitSplitter.deployed();
    const bond = await Bond.deployed();
    const amount = "5";

    await instance.changeIncoming(Bond.address, governor, {from: governor});

    await bond.transfer(ProfitSplitter.address, amount);
    const startOwnerBalance = await bond.balanceOf(governor);

    await instance.transfer(governor, amount, {from: governor});
    const endSplitterBalance = await bond.balanceOf(ProfitSplitter.address);
    const endOwnerBalance = await bond.balanceOf(governor);
    assert.equal(
      endSplitterBalance.toString(),
      "0",
      "Invalid end splitter balance"
    );
    assert.equal(
      endOwnerBalance.toString(),
      startOwnerBalance.add(utils.toBN(amount)).toString(),
      "Invalid end owner balance"
    );
  });

  it("transfer: should revert tx if sender not owner", async () => {
    const instance = await ProfitSplitter.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.transfer(governor, '1', {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
