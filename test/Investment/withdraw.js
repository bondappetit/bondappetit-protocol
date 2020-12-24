const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Investment.withdraw", ({web3, artifacts}) => {
  const {USDT, USDC, WETH} = development.assets;
  const governor = development.accounts.Governor.address;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const recipient = development.accounts.Governor.address;
  const uniswap = new web3.eth.Contract(
    development.contracts.UniswapV2Router02.abi,
    development.contracts.UniswapV2Router02.address
  );
  const usdtContract = new web3.eth.Contract(
    development.contracts.ABT.abi,
    USDT.address
  );
  const usdcContract = new web3.eth.Contract(
    development.contracts.ABT.abi,
    USDC.address
  );

  it("withdraw: should withdraw cumulative tokens to recipient", async () => {
    const [instance, bondContract] = await artifacts.requireAll(
      "Investment",
      "Bond"
    );
    const amountIn = "1000000";
    const usdcRecipientBalanceStart = await usdcContract.methods
      .balanceOf(recipient)
      .call();
    const amountOut = await uniswap.methods
      .getAmountsOut(amountIn, [USDT.address, WETH.address, USDC.address])
      .call();

    await bondContract.methods
      .mint(
        instance._address,
        bn("10000000000")
          .mul(bn("10").pow(bn("18")))
          .toString()
      )
      .send({from: governor});
    await usdtContract.methods
      .approve(instance._address, amountIn)
      .send({from: investor, gas: 2000000});
    await instance.methods.invest(USDT.address, amountIn).send({
      from: investor,
      gas: 2000000,
    });
    await instance.methods
      .withdraw(recipient)
      .send({from: recipient, gas: 2000000});

    const usdcRecipientBalanceEnd = await usdcContract.methods
      .balanceOf(recipient)
      .call();
    const usdcInvestmentBalanceEnd = await usdcContract.methods
      .balanceOf(instance._address)
      .call();

    assert.equal(
      usdcRecipientBalanceEnd,
      bn(usdcRecipientBalanceStart).add(bn(amountOut[2])).toString(),
      "Recipient balance should add"
    );
    assert.equal(usdcInvestmentBalanceEnd, "0", "Cumulative tokens should sub");
  });
});
