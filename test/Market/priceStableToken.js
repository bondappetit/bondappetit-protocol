const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.priceStableToken", ({web3, artifacts}) => {
  const {UniswapAnchoredView} = development.contracts;
  const priceOracle = new web3.eth.Contract(
    UniswapAnchoredView.abi,
    UniswapAnchoredView.address
  );
  const {USDC, DAI} = development.assets;

  it("priceStableToken: should get stable token price for cumulative token", async () => {
    const instance = await artifacts.require("Market");
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();

    const price = await instance.methods.priceStableToken(USDC.address, amount).call();
    assert.equal(
      price.toString(),
      bn(usdcPrice)
        .mul(bn(10).pow(bn(12)))
        .toString(),
      "Invalid cumulative token price"
    );
  });

  it("priceStableToken: should get stable token price for other token", async () => {
    const instance = await artifacts.require("Market");
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();
    const daiPrice = await priceOracle.methods.price(DAI.symbol).call();
    const priceAccuracy = bn("1000000");
    const expectedPrice = bn(daiPrice)
      .mul(priceAccuracy)
      .div(bn(usdcPrice))
      .mul(bn(amount))
      .div(priceAccuracy)
      .toString();

    const price = await instance.methods.priceStableToken(DAI.address, amount).call();
    assert.equal(price, expectedPrice, "Invalid token price");
  });

  it("priceStableToken: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");
    const [, notAllowedToken] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.priceStableToken(notAllowedToken, 1).call(),
      "Market::price: invalid token"
    );
  });
});
