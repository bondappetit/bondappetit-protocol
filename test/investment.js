const {utils} = require("web3");
const networks = require("../networks");
const assertions = require("truffle-assertions");
const Investment = artifacts.require("Investment");

contract("Investment", (accounts) => {
  const {USDT} = networks.development;

  it("should get usd price for token", async () => {
    const instance = await Investment.deployed();

    const priceUSD = await instance.priceUSD(USDT);

    assert.equal(
      priceUSD.toString(),
      utils.toBN("1000000000000000000").toString(),
      "USDT price should be 1 usd"
    );
  });

  it("should get bond price for token", async () => {
    const instance = await Investment.deployed();

    const price = await instance.price(USDT);
    assert.equal(
      price.toString(),
      utils.toBN("1000000000000000000").toString(),
      "USDT price should be 1 bond"
    );
  });

  it("should get bond price for token with updated bond price", async () => {
    const instance = await Investment.deployed();

    await instance.changeBondPrice(2 * 10 ** 6); // 2 usd for 1 bond
    const price = await instance.price(USDT);
    assert.equal(
      price.toString(),
      utils.toBN("500000000000000000").toString(),
      "USDT price should be 0.5 bond for price 1/2"
    );
  });
});
