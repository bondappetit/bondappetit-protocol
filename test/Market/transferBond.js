const assertions = require("truffle-assertions");
const Bond = artifacts.require("Bond");
const Market = artifacts.require("Market");
const {development} = require("../../networks");

contract("Market.transferBond", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("transferABT: should transfer ABT tokens", async () => {
    const instance = await Market.deployed();
    const bond = await Bond.deployed();
    const recipient = accounts[1];
    const amount = '1000000';

    assert.equal(
      await bond.balanceOf(recipient),
      0,
      "Invalid start balance"
    );


    bond.mint(Market.address, amount, {from: governor});
    await instance.transferBond(recipient, amount, {from: governor});
    assert.equal(
      await bond.balanceOf(recipient),
      amount,
      "Invalid end balance"
    );
  });

  it("approve: should revert tx if called is not the owner", async () => {
    const instance = await Market.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.transferBond(notOwner, '1000000', {from: notOwner}),
      "Ownable: caller is not the owner."
    );
  });
});