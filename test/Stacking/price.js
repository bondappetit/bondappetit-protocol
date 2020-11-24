const {utils} = require("web3");
const Bond = artifacts.require("Bond");
const Stacking = artifacts.require("Stacking");

contract("Stacking.price", (accounts) => {
  it("price: should get current price", async () => {
    const instance = await Stacking.deployed();

    const currentReward = await instance.rewards(Bond.address);
    const currentDelta = currentReward.delta.toString();
    assert.notEqual(currentDelta, "0", "Start delta invalid");
    const lastBlockNumber = currentReward.blockAt.toString();
    const currentBlockNumber = await web3.eth.getBlockNumber();
    const currentPrice = await instance.price(Bond.address);
    assert.equal(
      currentPrice,
      utils
        .toBN(currentBlockNumber)
        .sub(utils.toBN(lastBlockNumber))
        .mul(utils.toBN(currentDelta))
        .toString(),
      "Current price invalid"
    );
  });
});
