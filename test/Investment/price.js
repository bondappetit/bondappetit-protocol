const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Investment.prices", ({artifacts}) => {
  const governor = development.accounts.Governor.address;
  const {USDC} = development.assets;

  it("price: should get governance token price for invest token without swap", async () => {
    const instance = await artifacts.require("Investment");

    const price = await instance.methods.price(USDC.address, "2500000").call();

    assert.equal(price, "1000000000000000000", "USDC price should be 2.5 governance token");
  });

  it("changeGovernanceTokenPrice: should get governance token price for invest token with updated governane token price", async () => {
    const instance = await artifacts.require("Investment");

    await instance.methods.changeGovernanceTokenPrice(2 * 10 ** 6).send({from: governor});
    const price = await instance.methods.price(USDC.address, "1000000").call();

    assert.equal(
      price,
      "500000000000000000",
      "USDC price should be 0.5 governance token for price 1/2"
    );
  });
});
