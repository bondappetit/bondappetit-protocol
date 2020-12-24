const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Stacking.price", ({web3, artifacts}) => {
  const {Bond} = development.contracts;

  it("price: should get current price", async () => {
    const instance = await artifacts.require("Stacking");

    const currentReward = await instance.methods.rewards(Bond.address).call();
    const currentDelta = currentReward.delta;
    assert.notEqual(currentDelta, "0", "Start delta invalid");
    const lastBlockNumber = currentReward.blockAt;
    const currentBlockNumber = await web3.eth.getBlockNumber();
    const currentPrice = await instance.methods.price(Bond.address).call();
    assert.equal(
      currentPrice,
      bn(currentBlockNumber)
        .sub(bn(lastBlockNumber))
        .mul(bn(currentDelta))
        .toString(),
      "Current price invalid"
    );
  });
});
