const assertions = require("truffle-assertions");
const {utils} = require("web3");
const IUniswapAnchoredView = artifacts.require("uniswap/IUniswapAnchoredView");
const Market = artifacts.require("Market");
const {development} = require("../../networks");

contract("Market.priceABT", (accounts) => {
  const {
    UniswapAnchoredView: {address: priceOracleAddress},
  } = development.contracts;
  const priceOracle = new web3.eth.Contract(
    IUniswapAnchoredView.abi,
    priceOracleAddress
  );
  const {USDC, DAI} = development.assets;

  it("priceABT: should get abt token price for cumulative token", async () => {
    const instance = await Market.deployed();
    const amount = utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(6)))
      .toString();

    const usdcPrice = await priceOracle.methods.price(USDC.symbol).call();

    const price = await instance.priceABT(USDC.address, amount);
    assert.equal(
      price.toString(),
      utils
        .toBN(usdcPrice)
        .mul(utils.toBN(10).pow(utils.toBN(12)))
        .toString(),
      "Invalid cumulative token price"
    );
  });

  it("priceABT: should get abt token price for other token", async () => {
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

    const price = await instance.priceABT(DAI.address, amount);
    assert.equal(
      price.toString(),
      expectedPrice.toString(),
      "Invalid token price"
    );
  });

  it("priceABT: should revert tx if token is not allowed", async () => {
    const instance = await Market.deployed();
    const notAllowedToken = accounts[1];

    await assertions.reverts(
      instance.priceABT(notAllowedToken, 1),
      "Market::price: invalid token"
    );
  });
});
