const networks = require("../../networks");
const Investment = artifacts.require("Investment");

contract("Investment.prices", (accounts) => {
  const {USDC} = networks.development.assets;

  it("price: should get bond price for token", async () => {
    const instance = await Investment.deployed();

    const price = await instance.price(USDC.address, "1000000");

    assert.equal(
      price.toString(),
      '994003000000000000',
      "USDC price should be 1 bond"
    );
  });

  it("changeBondPrice: should get bond price for token with updated bond price", async () => {
    const instance = await Investment.deployed();

    await instance.changeBondPrice(2 * 10 ** 6);
    const price = await instance.price(USDC.address, "1000000");

    assert.equal(
      price.toString(),
      '497001500000000000',
      "USDC price should be 0.5 bond for price 1/2"
    );
  });
});
