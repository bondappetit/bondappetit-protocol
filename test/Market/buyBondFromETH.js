const assertions = require("truffle-assertions");
const {utils} = require("web3");
const IUniswapV2Router02 = artifacts.require("uniswap/IUniswapV2Router02");
const IERC20 = artifacts.require("IERC20");
const Bond = artifacts.require("Bond");
const Market = artifacts.require("Market");
const {development} = require("../../networks");

contract("Market.buyBondFromETH", (accounts) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {
    UniswapV2Router02,
  } = development.contracts;
  const uniswap = new web3.eth.Contract(
    IUniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, WETH} = development.assets;

  it("buyBondFromETH: should buy bond token", async () => {
    const instance = await Market.deployed();
    const bond = await Bond.deployed();
    const usdc = new web3.eth.Contract(IERC20.abi, USDC.address);
    const startBond = utils.toBN('1000').mul(utils.toBN(10).pow(utils.toBN(18))).toString();
    const amount = utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(18)))
      .toString();
    const usdcSwapAmount = (await uniswap.methods
      .getAmountsOut(amount, [
        await uniswap.methods.WETH().call(),
        USDC.address,
      ])
      .call())[1];

    await bond.transfer(customer, 1, {from: governor});

    await bond.mint(Market.address, startBond);
    const marketUSDCStartBalance = await usdc.methods.balanceOf(Market.address).call();
    const customerBondStartBalance = await bond.balanceOf(customer);
    const marketBondStartBalance = await bond.balanceOf(Market.address);
    assert.equal(
      customerBondStartBalance.toString(),
      '1',
      "Invalid bond token start balance for customer"
    );

    const reward = await instance.priceBond(WETH.address, amount);
    await instance.buyBondFromETH({value: amount, from: customer});

    const marketUSDCEndBalance = await usdc.methods.balanceOf(Market.address).call();
    const customerBondEndBalance = await bond.balanceOf(customer);
    const marketBondEndBalance = await bond.balanceOf(Market.address);
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

  it("buyBondFromETH: should revert tx if token is not allowed", async () => {
    const instance = await Market.deployed();

    await instance.denyToken(WETH.address, {from: governor})
    await assertions.reverts(
      instance.buyBondFromETH({value: 1, from: customer}),
      "Market::buyFromETH: invalid token"
    );
  });

  it("buyBondFromETH: should revert tx if customer not tokenholder", async () => {
    const instance = await Market.deployed();
    const notTokenholder = accounts[1];

    await instance.allowToken(WETH.address, 'ETH', {from: governor})

    await assertions.reverts(
      instance.buyBondFromETH({value: 1, from: notTokenholder}),
      "Market::buyBondFromETH: only tokenholder can buy new bond tokens"
    );
  });
});
