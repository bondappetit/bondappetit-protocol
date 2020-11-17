const {utils} = require("web3");
const networks = require("../../networks");
const Investment = artifacts.require("Investment");
const IERC20 = artifacts.require("IERC20");
const Uniswap2Router = artifacts.require("IUniswapV2Router02");

contract("Investment.withdraw", () => {
  const {USDT, USDC, WETH} = networks.development.assets;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const recipient = networks.development.accounts.Governor.address;
  const uniswap = new web3.eth.Contract(
    Uniswap2Router.abi,
    networks.development.contracts.UniswapV2Router02.address
  );
  const usdtContract = new web3.eth.Contract(IERC20.abi, USDT.address);
  const usdcContract = new web3.eth.Contract(IERC20.abi, USDC.address);

  it("withdraw: should withdraw cumulative tokens to recipient", async () => {
    const amountIn = "1000000";
    const instance = await Investment.deployed();
    const usdcRecipientBalanceStart = await usdcContract.methods
      .balanceOf(recipient)
      .call();
    const amountOut = await uniswap.methods
      .getAmountsOut(amountIn, [USDT.address, WETH.address, USDC.address])
      .call();

    await usdtContract.methods
      .approve(Investment.address, amountIn)
      .send({from: investor, gas: 2000000});
    await instance.invest(USDT.address, amountIn, {
      from: investor,
      gas: 2000000,
    });
    await instance.withdraw(recipient, {from: recipient, gas: 2000000});

    const usdcRecipientBalanceEnd = await usdcContract.methods
      .balanceOf(recipient)
      .call();
    const usdcInvestmentBalanceEnd = await usdcContract.methods
      .balanceOf(Investment.address)
      .call();

    assert.equal(
      usdcRecipientBalanceEnd,
      utils
        .toBN(usdcRecipientBalanceStart)
        .add(utils.toBN(amountOut[2]))
        .toString(),
      "Recipient balance should add"
    );
    assert.equal(usdcInvestmentBalanceEnd, "0", "Cumulative tokens should sub");
  });
});
