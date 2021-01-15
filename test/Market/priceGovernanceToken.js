const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.priceGovernanceToken", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const {UniswapAnchoredView} = development.contracts;
  const priceOracle = new web3.eth.Contract(
    UniswapAnchoredView.abi,
    UniswapAnchoredView.address
  );
  const {USDC, DAI} = development.assets;

  it("priceGovernanceToken: should get governance token price for cumulative token", async () => {
    const instance = await artifacts.require("Market");
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();

    const price = await instance.methods.priceGovernanceToken(USDC.address, amount).call();
    assert.equal(
      price,
      bn(usdcPrice)
        .mul(bn(10).pow(bn(12)))
        .toString(),
      "Invalid cumulative token price"
    );
  });

  it("priceGovernanceToken: should get governance token price for other token", async () => {
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

    const price = await instance.methods.priceGovernanceToken(DAI.address, amount).call();
    assert.equal(price, expectedPrice, "Invalid token price");
  });

  it("priceGovernanceToken: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");
    const [, notAllowedToken] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.priceGovernanceToken(notAllowedToken, 1).call(),
      "Market::price: invalid token"
    );
  });

  it("priceGovernanceToken: should get governance token price with changed governance price", async () => {
    const instance = await artifacts.require("Market");
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();
    const govPrice = "2000000";

    await instance.methods.changeGovernanceTokenPrice(govPrice).send({from: governor});

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();
    const daiPrice = await priceOracle.methods.price(DAI.symbol).call();
    const priceAccuracy = bn("1000000");
    const expectedPrice = bn(daiPrice)
      .mul(priceAccuracy)
      .div(bn(usdcPrice))
      .mul(bn(amount))
      .div(priceAccuracy)
      .mul(priceAccuracy)
      .div(bn(govPrice))
      .toString();

    const price = await instance.methods.priceGovernanceToken(DAI.address, amount).call();
    assert.equal(
      price,
      expectedPrice,
      "Invalid token price with change governance token price"
    );
  });
});
