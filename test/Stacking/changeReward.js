const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Bond = artifacts.require("Bond");
const Stacking = artifacts.require("Stacking");
const {development} = require("../../networks");

contract("Stacking.changeReward", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("changeReward: should change reward of stacking token", async () => {
    const instance = await Stacking.deployed();
    const bond = await Bond.deployed();
    const delta = "10";

    const startReward = await instance.rewards(Bond.address);
    const startPrice = await instance.price(Bond.address);

    await instance.changeReward(Bond.address, delta, {from: governor});
    const firstReward = await instance.rewards(Bond.address);
    const firstPrice = await instance.price(Bond.address);
    assert.notEqual(firstReward.delta, startReward.delta, "Changed delta failed");
    assert.equal(firstReward.delta, delta, "Invalid changed reward delta");
    assert.equal(firstPrice.toString(), startPrice.add(utils.toBN(delta)), "Invalid first price");

    await bond.transfer(governor, '0', {from: governor}); // Next block.

    const secondPrice = await instance.price(Bond.address);
    assert.equal(secondPrice.toString(), startPrice.add(utils.toBN(delta)).add(utils.toBN(delta)), "Invalid second price");

    await instance.changeReward(Bond.address, startReward.delta.toString(), {from: governor});

    const thirdPrice = await instance.price(Bond.address);
    assert.equal(thirdPrice.toString(), startPrice.add(utils.toBN(delta)).add(utils.toBN(delta)).add(startReward.delta), "Invalid third price");
  });

  it("changeReward: should revert tx if called is not the owner", async () => {
    const instance = await Stacking.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.changeReward(Bond.address, "1000000", {from: notOwner}),
      "Ownable: caller is not the owner."
    );
  });
});
