const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Investment.investETH", ({web3, artifacts}) => {
  const {USDC, WETH} = development.assets;
  const governor = development.accounts.Governor.address;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const uniswap = new web3.eth.Contract(
    development.contracts.UniswapV2Router02.abi,
    development.contracts.UniswapV2Router02.address
  );
  const usdcContract = new web3.eth.Contract(
    development.contracts.Stable.abi,
    USDC.address
  );

  it("investETH: should get eth with swap", async () => {
    const [instance, govContract] = await artifacts.requireAll(
      "Investment",
      "GovernanceToken"
    );

    await govContract.methods
      .mint(
        instance._address,
        bn("10000000000")
          .mul(bn("10").pow(bn("18")))
          .toString()
      )
      .send({from: governor});
    const amountIn = "1000000000000000000";
    const usdcInvestmentBalanceStart = await usdcContract.methods
      .balanceOf(instance._address)
      .call();
    const govInvestorBalanceStart = await govContract.methods
      .balanceOf(investor)
      .call();
    const amountOut = await uniswap.methods
      .getAmountsOut(amountIn, [WETH.address, USDC.address])
      .call();
    const reward = await instance.methods.price(WETH.address, amountIn).call();

    await instance.methods.investETH().send({
      from: investor,
      value: amountIn,
      gas: 6000000,
    });

    const usdcInvestmentBalanceEnd = await usdcContract.methods
      .balanceOf(instance._address)
      .call();
    const govInvestorBalanceEnd = await govContract.methods
      .balanceOf(investor)
      .call();
    assert.equal(
      govInvestorBalanceEnd,
      bn(govInvestorBalanceStart).add(bn(reward)).toString(),
      "Governance tokens should add"
    );
    assert.equal(
      usdcInvestmentBalanceEnd,
      bn(usdcInvestmentBalanceStart).add(bn(amountOut[1])).toString(),
      "Cumulative tokens should add"
    );
  });
});
