const assertions = require("truffle-assertions");
const {utils} = require("web3");
const IUniswapV2Router02 = artifacts.require("uniswap/IUniswapV2Router02");
const IERC20 = artifacts.require("IERC20");
const ABT = artifacts.require("ABT");
const Market = artifacts.require("Market");
const {development} = require("../../networks");

contract("Market.buyABT", (accounts) => {
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {
    UniswapV2Router02,
  } = development.contracts;
  const uniswap = new web3.eth.Contract(
    IUniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, WBTC} = development.assets;

  it("buyABT: should buy abt token for cumulative token", async () => {
    const instance = await Market.deployed();
    const abt = await ABT.deployed();
    const usdc = new web3.eth.Contract(IERC20.abi, USDC.address);
    const startABT = utils.toBN(10).pow(utils.toBN(18)).toString();
    const amount = utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(6)))
      .toString();

    await abt.mint(Market.address, startABT);
    const customerUSDCStartBalance = await usdc.methods.balanceOf(customer).call();
    const marketUSDCStartBalance = await usdc.methods.balanceOf(Market.address).call();
    const customerABTStartBalance = await abt.balanceOf(customer);
    const marketABTStartBalance = await abt.balanceOf(Market.address);
    assert.equal(
      customerABTStartBalance.toString(),
      '0',
      "Invalid abt token start balance for customer"
    );

    const reward = await instance.priceABT(USDC.address, amount);
    await usdc.methods.approve(Market.address, amount).send({from: customer});
    await instance.buyABT(USDC.address, amount, {from: customer});

    const customerUSDCEndBalance = await usdc.methods.balanceOf(customer).call();
    const marketUSDCEndBalance = await usdc.methods.balanceOf(Market.address).call();
    const customerABTEndBalance = await abt.balanceOf(customer);
    const marketABTEndBalance = await abt.balanceOf(Market.address);
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
      customerABTEndBalance.toString(),
      customerABTStartBalance.add(utils.toBN(reward)).toString(),
      "Invalid abt token end balance for customer"
    );
    assert.equal(
      marketABTEndBalance.toString(),
      marketABTStartBalance.sub(utils.toBN(reward)).toString(),
      "Invalid abt token end balance for market"
    );
  });

  it("buyABT: should buy abt token for other token", async () => {
    const instance = await Market.deployed();
    const abt = await ABT.deployed();
    const wbtc = new web3.eth.Contract(IERC20.abi, WBTC.address);
    const usdc = new web3.eth.Contract(IERC20.abi, USDC.address);
    const startABT = utils
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

    await abt.mint(Market.address, startABT);
    const customerWBTCStartBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(Market.address)
      .call();
    const customerABTStartBalance = await abt.balanceOf(customer);
    const marketABTStartBalance = await abt.balanceOf(Market.address);

    const reward = await instance.priceABT(WBTC.address, amount);
    await wbtc.methods.approve(Market.address, amount).send({from: customer});
    await instance.buyABT(WBTC.address, amount, {from: customer});

    const customerWBTCEndBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(Market.address)
      .call();
    const customerABTEndBalance = await abt.balanceOf(customer);
    const marketABTEndBalance = await abt.balanceOf(Market.address);
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
      customerABTEndBalance.toString(),
      customerABTStartBalance.add(utils.toBN(reward)).toString(),
      "Invalid abt token end balance for customer"
    );
    assert.equal(
      marketABTEndBalance.toString(),
      marketABTStartBalance.sub(utils.toBN(reward)).toString(),
      "Invalid abt token end balance for market"
    );
  });

  it("buyABT: should revert tx if token is not allowed", async () => {
    const instance = await Market.deployed();
    const notAllowedToken = accounts[1];

    await assertions.reverts(
      instance.buyABT(notAllowedToken, 1),
      "Market::buy: invalid token"
    );
  });
});
