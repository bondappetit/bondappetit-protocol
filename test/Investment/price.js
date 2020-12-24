const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Investment.prices", ({artifacts}) => {
  const governor = development.accounts.Governor.address;
  const {USDC} = development.assets;

  it("price: should get bond price for token without swap", async () => {
    const instance = await artifacts.require("Investment");

    const price = await instance.methods.price(USDC.address, "1000000").call();

    assert.equal(price, "1000000000000000000", "USDC price should be 1 bond");
  });

  it("changeBondPrice: should get bond price for token with updated bond price", async () => {
    const instance = await artifacts.require("Investment");

    await instance.methods.changeBondPrice(2 * 10 ** 6).send({from: governor});
    const price = await instance.methods.price(USDC.address, "1000000").call();

    assert.equal(
      price,
      "500000000000000000",
      "USDC price should be 0.5 bond for price 1/2"
    );
  });
});
