const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Stacking.changeReward", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeReward: should change reward of stacking token", async () => {
    const [instance, bond] = await artifacts.requireAll("Stacking", "Bond");
    const delta = "10";

    const startReward = await instance.methods.rewards(bond._address).call();
    const startPrice = await instance.methods.price(bond._address).call();

    await instance.methods
      .changeReward(bond._address, delta)
      .send({from: governor});
    const firstReward = await instance.methods.rewards(bond._address).call();
    const firstPrice = await instance.methods.price(bond._address).call();
    assert.notEqual(
      firstReward.delta,
      startReward.delta,
      "Changed delta failed"
    );
    assert.equal(firstReward.delta, delta, "Invalid changed reward delta");
    assert.equal(
      firstPrice,
      bn(startPrice).add(bn(delta)).toString(),
      "Invalid first price"
    );

    await bond.methods.transfer(governor, "0").send({from: governor}); // Next block.

    const secondPrice = await instance.methods.price(bond._address).call();
    assert.equal(
      secondPrice,
      bn(startPrice).add(bn(delta)).add(bn(delta)).toString(),
      "Invalid second price"
    );

    await instance.methods.changeReward(bond._address, startReward.delta).send({
      from: governor,
    });

    const thirdPrice = await instance.methods.price(bond._address).call();
    assert.equal(
      thirdPrice,
      bn(startPrice)
        .add(bn(delta))
        .add(bn(delta))
        .add(bn(startReward.delta))
        .toString(),
      "Invalid third price"
    );
  });

  it("changeReward: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Stacking");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.changeReward(notOwner, "1000000").send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
