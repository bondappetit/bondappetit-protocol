const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.priceBond", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const {UniswapAnchoredView} = development.contracts;
  const priceOracle = new web3.eth.Contract(
    UniswapAnchoredView.abi,
    UniswapAnchoredView.address
  );
  const {USDC, DAI} = development.assets;

  it("priceBond: should get bond token price for cumulative token", async () => {
    const instance = await artifacts.require("Market");
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();

    const price = await instance.methods.priceBond(USDC.address, amount).call();
    assert.equal(
      price,
      bn(usdcPrice)
        .mul(bn(10).pow(bn(12)))
        .toString(),
      "Invalid cumulative token price"
    );
  });

  it("priceBond: should get bond token price for other token", async () => {
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

    const price = await instance.methods.priceBond(DAI.address, amount).call();
    assert.equal(price, expectedPrice, "Invalid token price");
  });

  it("priceBond: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");
    const notAllowedToken = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.priceBond(notAllowedToken, 1).call(),
      "Market::price: invalid token"
    );
  });

  it("priceBond: should get bond token price with changed bond price", async () => {
    const instance = await artifacts.require("Market");
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();
    const bondPrice = "2000000";

    await instance.methods.changeBondPrice(bondPrice).send({from: governor});

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();
    const daiPrice = await priceOracle.methods.price(DAI.symbol).call();
    const priceAccuracy = bn("1000000");
    const expectedPrice = bn(daiPrice)
      .mul(priceAccuracy)
      .div(bn(usdcPrice))
      .mul(bn(amount))
      .div(priceAccuracy)
      .mul(priceAccuracy)
      .div(bn(bondPrice))
      .toString();

    const price = await instance.methods.priceBond(DAI.address, amount).call();
    assert.equal(
      price,
      expectedPrice,
      "Invalid token price with change bond price"
    );
  });
});
