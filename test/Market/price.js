const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");

contract("Market.price", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const {UsdcUsdPriceFeed, DaiUsdPriceFeed} = development.contracts;
  const usdcPriceOracle = new web3.eth.Contract(
    UsdcUsdPriceFeed.abi,
    UsdcUsdPriceFeed.address
  );
  const daiPriceOracle = new web3.eth.Contract(
    DaiUsdPriceFeed.abi,
    DaiUsdPriceFeed.address
  );
  const {USDC, DAI} = network.assets;

  it("price: should get product token price and reward amount", async () => {
    const [instance, gov, stable] = await artifacts.requireAll(
      "Market",
      "GovernanceToken",
      "StableToken"
    );
    const payment = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();
    const rewardBalance = "100000";
    const expectedProduct = `1${"0".repeat(18)}`;

    await stable.methods
      .mint(instance._address, bn(expectedProduct).mul(bn(10)).toString())
      .send({from: governor});
    await gov.methods
      .transfer(instance._address, rewardBalance)
      .send({from: governor});

    const {product, reward} = await instance.methods
      .price(USDC.address, payment)
      .call();
    assert.equal(product, expectedProduct, "Invalid cumulative token price");
    assert.equal(
      reward,
      bn(rewardBalance).div(bn(10)).toString(),
      "Invalid cumulative token price"
    );
  });

  it("price: should get product token price for other token", async () => {
    const instance = await artifacts.require("Market");
    const amount = `1${"0".repeat(6)}`;

    const {
      answer: usdcPrice,
    } = await usdcPriceOracle.methods.latestRoundData().call();
    const {
      answer: daiPrice,
    } = await daiPriceOracle.methods.latestRoundData().call();
    const priceAccuracy = bn("1000000");
    const expectedPrice = bn(daiPrice)
      .mul(priceAccuracy)
      .div(bn(usdcPrice))
      .mul(bn(amount))
      .div(priceAccuracy)
      .toString();

    const {product} = await instance.methods.price(DAI.address, amount).call();
    assert.equal(product, expectedPrice, "Invalid token price");
  });

  it("price: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");
    const [, notAllowedToken] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.price(notAllowedToken, 1).call(),
      "Market::price: currency not allowed"
    );
  });
});
