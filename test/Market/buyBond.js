const assertions = require("truffle-assertions");
const {utils} = require("web3");
const IUniswapV2Router02 = artifacts.require("uniswap/IUniswapV2Router02");
const IERC20 = artifacts.require("IERC20");
const Bond = artifacts.require("Bond");
const Market = artifacts.require("Market");
const {development} = require("../../networks");

contract("Market.buyBond", (accounts) => {
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {
    UniswapV2Router02,
    UniswapAnchoredView: {address: priceOracleAddress},
  } = development.contracts;
  const uniswap = new web3.eth.Contract(
    IUniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, WBTC} = development.assets;

  it("buyBond: should buy bond token for cumulative token", async () => {
    const instance = await Market.deployed();
    const bond = await Bond.deployed();
    const usdc = new web3.eth.Contract(IERC20.abi, USDC.address);
    const startBond = utils.toBN(10).pow(utils.toBN(18)).toString();
    const amount = utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(6)))
      .toString();

    await bond.mint(Market.address, startBond);
    const customerUSDCStartBalance = await usdc.methods.balanceOf(customer).call();
    const marketUSDCStartBalance = await usdc.methods.balanceOf(Market.address).call();
    const customerBondStartBalance = await bond.balanceOf(customer);
    const marketBondStartBalance = await bond.balanceOf(Market.address);
    assert.equal(
      customerBondStartBalance.toString(),
      '0',
      "Invalid bond token start balance for customer"
    );

    const reward = await instance.priceBond(USDC.address, amount);
    await usdc.methods.approve(Market.address, amount).send({from: customer});
    await instance.buyBond(USDC.address, amount, {from: customer});

    const customerUSDCEndBalance = await usdc.methods.balanceOf(customer).call();
    const marketUSDCEndBalance = await usdc.methods.balanceOf(Market.address).call();
    const customerBondEndBalance = await bond.balanceOf(customer);
    const marketBondEndBalance = await bond.balanceOf(Market.address);
    assert.equal(
      customerUSDCEndBalance.toString(),
      utils.toBN(customerUSDCStartBalance).sub(utils.toBN(amount)).toString(),
      "Invalid token end balance for customer"
    );
    assert.equal(
      marketUSDCEndBalance.toString(),
      utils.toBN(marketUSDCStartBalance).add(utils.toBN(amount)).toString(),
      "Invalid token end balance for market"
    );
    assert.equal(
      customerBondEndBalance.toString(),
      customerBondStartBalance.add(utils.toBN(reward)).toString(),
      "Invalid bond token end balance for customer"
    );
    assert.equal(
      marketBondEndBalance.toString(),
      marketBondStartBalance.sub(utils.toBN(reward)).toString(),
      "Invalid bond token end balance for market"
    );
  });

  it("buyBond: should buy bond token for other token", async () => {
    const instance = await Market.deployed();
    const bond = await Bond.deployed();
    const wbtc = new web3.eth.Contract(IERC20.abi, WBTC.address);
    const usdc = new web3.eth.Contract(IERC20.abi, USDC.address);
    const startBond = utils
      .toBN(1000)
      .mul(utils.toBN(10).pow(utils.toBN(18)))
      .toString();
    const amount = utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(5)))
      .toString();
    const usdcSwapAmount = (await uniswap.methods
      .getAmountsOut(amount, [
        WBTC.address,
        await uniswap.methods.WETH().call(),
        USDC.address,
      ])
      .call())[2];

    await bond.mint(Market.address, startBond);
    const customerWBTCStartBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(Market.address)
      .call();
    const customerBondStartBalance = await bond.balanceOf(customer);
    const marketBondStartBalance = await bond.balanceOf(Market.address);

    const reward = await instance.priceBond(WBTC.address, amount);
    await wbtc.methods.approve(Market.address, amount).send({from: customer});
    await instance.buyBond(WBTC.address, amount, {from: customer});

    const customerWBTCEndBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(Market.address)
      .call();
    const customerBondEndBalance = await bond.balanceOf(customer);
    const marketBondEndBalance = await bond.balanceOf(Market.address);
    assert.equal(
      customerWBTCEndBalance.toString(),
      utils.toBN(customerWBTCStartBalance).sub(utils.toBN(amount)).toString(),
      "Invalid token end balance for customer"
    );
    assert.equal(
      marketUSDCEndBalance.toString(),
      utils.toBN(marketUSDCStartBalance).add(utils.toBN(usdcSwapAmount)).toString(),
      "Invalid token end balance for market"
    );
    assert.equal(
      customerBondEndBalance.toString(),
      customerBondStartBalance.add(utils.toBN(reward)).toString(),
      "Invalid bond token end balance for customer"
    );
    assert.equal(
      marketBondEndBalance.toString(),
      marketBondStartBalance.sub(utils.toBN(reward)).toString(),
      "Invalid bond token end balance for market"
    );
  });

  it("buyBond: should revert tx if token is not allowed", async () => {
    const instance = await Market.deployed();
    const notAllowedToken = accounts[1];

    await assertions.reverts(
      instance.buyBond(notAllowedToken, 1),
      "Market::buy: invalid token"
    );
  });
});
