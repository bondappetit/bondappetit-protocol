const {utils} = require("web3");
const networks = require("../../networks");
const Investment = artifacts.require("Investment");
const Bond = artifacts.require("Bond");
const IERC20 = artifacts.require("IERC20");
const Uniswap2Router = artifacts.require("IUniswapV2Router02");

contract("Investment.investETH", (accounts) => {
  const {USDC, WETH} = networks.development.assets;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const uniswap = new web3.eth.Contract(
    Uniswap2Router.abi,
    networks.development.contracts.UniswapV2Router02.address
  );
  const usdcContract = new web3.eth.Contract(IERC20.abi, USDC.address);

  it("investETH: should get eth with swap", async () => {
    const amountIn = "1000000000000000000";
    const instance = await Investment.deployed();
    const bondContract = await Bond.deployed();
    const usdcInvestmentBalanceStart = await usdcContract.methods.balanceOf(Investment.address).call();
    const bondInvestorBalanceStart = await bondContract.balanceOf(investor);
    const amountOut = await uniswap.methods
        .getAmountsOut(amountIn, [WETH.address, USDC.address])
        .call();
    const reward = await instance.price(WETH.address, amountIn);

    await instance.investETH({
      from: investor,
      value: amountIn,
      gas: 2000000,
    });

    const usdcInvestmentBalanceEnd = await usdcContract.methods.balanceOf(Investment.address).call();
    const bondInvestorBalanceEnd = await bondContract.balanceOf(investor);
    assert.equal(
      bondInvestorBalanceEnd,
      utils.toBN(bondInvestorBalanceStart).add(utils.toBN(reward)).toString(),
      "Bond tokens should add"
    );
    assert.equal(
      usdcInvestmentBalanceEnd,
      utils.toBN(usdcInvestmentBalanceStart).add(utils.toBN(amountOut[1])).toString(),
      "Cumulative tokens should add"
    );
  });
});
