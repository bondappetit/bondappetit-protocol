const assertions = require("truffle-assertions");
const {utils} = require("web3");
const IUniswapAnchoredView = artifacts.require("uniswap/IUniswapAnchoredView");
const Market = artifacts.require("Market");
const {development} = require("../../networks");

contract("Market.priceBond", (accounts) => {
  const governor = development.accounts.Governor.address;
  const {
    UniswapAnchoredView: {address: priceOracleAddress},
  } = development.contracts;
  const priceOracle = new web3.eth.Contract(
    IUniswapAnchoredView.abi,
    priceOracleAddress
  );
  const {USDC, DAI} = development.assets;

  it("priceBond: should get bond token price for cumulative token", async () => {
    const instance = await Market.deployed();
    const amount = utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(6)))
      .toString();

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();

    const price = await instance.priceBond(USDC.address, amount);
    assert.equal(
      price.toString(),
      utils
        .toBN(usdcPrice)
        .mul(utils.toBN(10).pow(utils.toBN(12)))
        .toString(),
      "Invalid cumulative token price"
    );
  });

  it("priceBond: should get bond token price for other token", async () => {
    const instance = await Market.deployed();
    const amount = utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(6)))
      .toString();

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();
    const daiPrice = await priceOracle.methods.price(DAI.symbol).call();
    const priceAccuracy = utils.toBN("1000000");
    const expectedPrice = utils
      .toBN(daiPrice)
      .mul(priceAccuracy)
      .div(utils.toBN(usdcPrice))
      .mul(utils.toBN(amount))
      .div(priceAccuracy);

    const price = await instance.priceBond(DAI.address, amount);
    assert.equal(
      price.toString(),
      expectedPrice.toString(),
      "Invalid token price"
    );
  });

  it("priceBond: should revert tx if token is not allowed", async () => {
    const instance = await Market.deployed();
    const notAllowedToken = accounts[1];

    await assertions.reverts(
      instance.priceBond(notAllowedToken, 1),
      "Market::price: invalid token"
    );
  });

  it("priceBond: should get bond token price with changed bond price", async () => {
    const instance = await Market.deployed();
    const amount = utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(6)))
      .toString();
      const bondPrice = '2000000';

      await instance.changeBondPrice(bondPrice, {from: governor});

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();
    const daiPrice = await priceOracle.methods.price(DAI.symbol).call();
    const priceAccuracy = utils.toBN("1000000");
    const expectedPrice = utils
      .toBN(daiPrice)
      .mul(priceAccuracy)
      .div(utils.toBN(usdcPrice))
      .mul(utils.toBN(amount))
      .div(priceAccuracy)
      .mul(priceAccuracy)
      .div(utils.toBN(bondPrice));

    const price = await instance.priceBond(DAI.address, amount);
    assert.equal(
      price.toString(),
      expectedPrice.toString(),
      "Invalid token price with change bond price"
    );
  });
});
