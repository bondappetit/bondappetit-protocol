const assertions = require("truffle-assertions");
const {utils} = require("web3");
const IUniswapV2Router02 = artifacts.require("uniswap/IUniswapV2Router02");
const IERC20 = artifacts.require("IERC20");
const ABT = artifacts.require("ABT");
const Market = artifacts.require("Market");
const {development} = require("../../networks");

contract("Market.buyABTFromETH", () => {
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

  it("buyABTFromETH: should buy abt token", async () => {
    const instance = await Market.deployed();
    const abt = await ABT.deployed();
    const usdc = new web3.eth.Contract(IERC20.abi, USDC.address);
    const startABT = utils.toBN('1000').mul(utils.toBN(10).pow(utils.toBN(18))).toString();
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

    await abt.mint(Market.address, startABT);
    const marketUSDCStartBalance = await usdc.methods.balanceOf(Market.address).call();
    const customerABTStartBalance = await abt.balanceOf(customer);
    const marketABTStartBalance = await abt.balanceOf(Market.address);
    assert.equal(
      customerABTStartBalance.toString(),
      '0',
      "Invalid abt token start balance for customer"
    );

    const reward = await instance.priceABT(WETH.address, amount);
    await instance.buyABTFromETH({value: amount, from: customer});

    const marketUSDCEndBalance = await usdc.methods.balanceOf(Market.address).call();
    const customerABTEndBalance = await abt.balanceOf(customer);
    const marketABTEndBalance = await abt.balanceOf(Market.address);
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

  it("buyABTFromETH: should revert tx if token is not allowed", async () => {
    const instance = await Market.deployed();

    await instance.denyToken(WETH.address, {from: governor})
    await assertions.reverts(
      instance.buyABTFromETH({value: 1}),
      "Market::buyFromETH: invalid token"
    );
  });
});
