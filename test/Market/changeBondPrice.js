const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Market = artifacts.require("Market");

contract("Market", (accounts) => {
  it("changeBondPrice: should change bond price", async () => {
    const instance = await Market.deployed();
    const startPrice = await instance.bondPrice();
    const newPrice = startPrice.add(utils.toBN('1000000')).toString();

    await instance.changeBondPrice(newPrice);
    assert.equal(
      newPrice,
      await instance.bondPrice(),
      "Invalid bond price"
    );
  });

  it("approve: should revert tx if called is not the owner", async () => {
    const instance = await Market.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.changeBondPrice('1000000', {from: notOwner}),
      "Ownable: caller is not the owner."
    );
  });
});