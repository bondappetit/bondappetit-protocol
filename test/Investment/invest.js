const assertions = require("truffle-assertions");
const {utils} = require("web3");
const networks = require("../../networks");
const Investment = artifacts.require("Investment");
const IERC20 = artifacts.require("IERC20");
const Uniswap2Router = artifacts.require("IUniswapV2Router02");

const Bond = artifacts.require("Bond");

contract("Investment.invest", (accounts) => {
  const {USDT, USDC, WETH} = networks.development.assets;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const uniswap = new web3.eth.Contract(
    Uniswap2Router.abi,
    networks.development.contracts.UniswapV2Router02.address
  );
  const usdtContract = new web3.eth.Contract(IERC20.abi, USDT.address);
  const usdcContract = new web3.eth.Contract(IERC20.abi, USDC.address);
  const notInvestableToken = accounts[1];

  it("invest: should get other tokens with swap", async () => {
    const amountIn = "1000000";
    const instance = await Investment.deployed();
    const bondContract = await Bond.deployed();
    const usdtInvestorBalanceStart = await usdtContract.methods.balanceOf(investor).call();
    const usdcInvestmentBalanceStart = await usdcContract.methods.balanceOf(Investment.address).call();
    const bondInvestorBalanceStart = await bondContract.balanceOf(investor);
    const amountOut = await uniswap.methods
        .getAmountsOut(amountIn, [USDT.address, WETH.address, USDC.address])
        .call();
    const reward = await instance.price(USDT.address, amountIn);

    await usdtContract.methods
      .approve(Investment.address, amountIn)
      .send({from: investor, gas: 2000000});
    await instance.invest(USDT.address, amountIn, {
      from: investor,
      gas: 2000000,
    });

    const usdtInvestorBalanceEnd = await usdtContract.methods.balanceOf(investor).call();
    const usdcInvestmentBalanceEnd = await usdcContract.methods.balanceOf(Investment.address).call();
    const bondInvestorBalanceEnd = await bondContract.balanceOf(investor);
    assert.equal(
      usdtInvestorBalanceEnd,
      utils.toBN(usdtInvestorBalanceStart).sub(utils.toBN(amountIn)).toString(),
      "Invest tokens should sub"
    );
    assert.equal(
      bondInvestorBalanceEnd.toString(),
      utils.toBN(bondInvestorBalanceStart).add(utils.toBN(reward)).toString(),
      "Bond tokens should add"
    );
    assert.equal(
      usdcInvestmentBalanceEnd,
      utils.toBN(usdcInvestmentBalanceStart).add(utils.toBN(amountOut[2])).toString(),
      "Cumulative tokens should add"
    );
  });

  it("invest: should revert tx if token is not investable", async () => {
    const instance = await Investment.deployed();
    
    await assertions.reverts(
      instance.invest(notInvestableToken, 1, {from: investor}),
      "Investment::invest: invalid investable token"
    );
  });

  it("invest: should get cumulative tokens without swap", async () => {
    const amountIn = "1000000";
    const instance = await Investment.deployed();
    const bondContract = await Bond.deployed();
    const usdcInvestorBalanceStart = await usdcContract.methods.balanceOf(investor).call();
    const usdcInvestmentBalanceStart = await usdcContract.methods.balanceOf(Investment.address).call();
    const bondInvestorBalanceStart = await bondContract.balanceOf(investor);
    const reward = await instance.price(USDC.address, amountIn);
    assert.equal(
      utils.toBN(amountIn).mul(utils.toBN('10').pow(utils.toBN('12'))),
      reward.toString(),
      "Invalid reward"
    );

    await usdcContract.methods
      .approve(Investment.address, amountIn)
      .send({from: investor, gas: 2000000});
    await instance.invest(USDC.address, amountIn, {
      from: investor,
      gas: 2000000,
    });

    const usdcInvestorBalanceEnd = await usdcContract.methods.balanceOf(investor).call();
    const usdcInvestmentBalanceEnd = await usdcContract.methods.balanceOf(Investment.address).call();
    const bondInvestorBalanceEnd = await bondContract.balanceOf(investor);
    assert.equal(
      usdcInvestorBalanceEnd,
      utils.toBN(usdcInvestorBalanceStart).sub(utils.toBN(amountIn)).toString(),
      "Invest tokens should sub"
    );
    assert.equal(
      bondInvestorBalanceEnd.toString(),
      utils.toBN(bondInvestorBalanceStart).add(utils.toBN(reward)).toString(),
      "Bond tokens should add"
    );
    assert.equal(
      usdcInvestmentBalanceEnd,
      utils.toBN(usdcInvestmentBalanceStart).add(utils.toBN(amountIn)).toString(),
      "Cumulative tokens should add"
    );
  });
});
