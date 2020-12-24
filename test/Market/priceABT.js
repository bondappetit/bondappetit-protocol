const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.priceABT", ({web3, artifacts}) => {
  const {UniswapAnchoredView} = development.contracts;
  const priceOracle = new web3.eth.Contract(
    UniswapAnchoredView.abi,
    UniswapAnchoredView.address
  );
  const {USDC, DAI} = development.assets;

  it("priceABT: should get abt token price for cumulative token", async () => {
    const instance = await artifacts.require("Market");
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();

    const price = await instance.methods.priceABT(USDC.address, amount).call();
    assert.equal(
      price.toString(),
      bn(usdcPrice)
        .mul(bn(10).pow(bn(12)))
        .toString(),
      "Invalid cumulative token price"
    );
  });

  it("priceABT: should get abt token price for other token", async () => {
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

    const price = await instance.methods.priceABT(DAI.address, amount).call();
    assert.equal(price, expectedPrice, "Invalid token price");
  });

  it("priceABT: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");
    const notAllowedToken = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.priceABT(notAllowedToken, 1).call(),
      "Market::price: invalid token"
    );
  });
});
