const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Investment.invest", ({web3, artifacts}) => {
  const {USDT, USDC, WETH} = development.assets;
  const governor = development.accounts.Governor.address;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const uniswap = new web3.eth.Contract(
    development.contracts.UniswapV2Router02.abi,
    development.contracts.UniswapV2Router02.address
  );
  const usdtContract = new web3.eth.Contract(
    development.contracts.Stable.abi,
    USDT.address
  );
  const usdcContract = new web3.eth.Contract(
    development.contracts.Stable.abi,
    USDC.address
  );

  it("invest: should get other tokens with swap", async () => {
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
    const amountIn = "100";
    const usdtInvestorBalanceStart = await usdtContract.methods
      .balanceOf(investor)
      .call();
    const usdcInvestmentBalanceStart = await usdcContract.methods
      .balanceOf(instance._address)
      .call();
    const govInvestorBalanceStart = await govContract.methods
      .balanceOf(investor)
      .call();
    const amountOut = await uniswap.methods
      .getAmountsOut(amountIn, [USDT.address, WETH.address, USDC.address])
      .call();
    const reward = await instance.methods.price(USDT.address, amountIn).call();

    await usdtContract.methods
      .approve(instance._address, amountIn)
      .send({from: investor, gas: 2000000});
    await instance.methods.invest(USDT.address, amountIn).send({
      from: investor,
      gas: 6000000,
    });

    const usdtInvestorBalanceEnd = await usdtContract.methods
      .balanceOf(investor)
      .call();
    const usdcInvestmentBalanceEnd = await usdcContract.methods
      .balanceOf(instance._address)
      .call();
    const govInvestorBalanceEnd = await govContract.methods
      .balanceOf(investor)
      .call();
    assert.equal(
      usdtInvestorBalanceEnd,
      bn(usdtInvestorBalanceStart).sub(bn(amountIn)).toString(),
      "Invest tokens should sub"
    );
    assert.equal(
      govInvestorBalanceEnd,
      bn(govInvestorBalanceStart).add(bn(reward)).toString(),
      "Governance tokens should add"
    );
    assert.equal(
      usdcInvestmentBalanceEnd,
      bn(usdcInvestmentBalanceStart).add(bn(amountOut[2])).toString(),
      "Cumulative tokens should add"
    );
  });

  it("invest: should revert tx if token is not investable", async () => {
    const instance = await artifacts.require("Investment");
    const [, notInvestableToken] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.invest(notInvestableToken, 1).send({from: investor}),
      "Investment::invest: invalid investable token"
    );
  });

  it("invest: should get cumulative tokens without swap", async () => {
    const [instance, govContract] = await artifacts.requireAll(
      "Investment",
      "GovernanceToken"
    );
    const amountIn = "100";
    const usdcInvestorBalanceStart = await usdcContract.methods
      .balanceOf(investor)
      .call();
    const usdcInvestmentBalanceStart = await usdcContract.methods
      .balanceOf(instance._address)
      .call();
    const govInvestorBalanceStart = await govContract.methods
      .balanceOf(investor)
      .call();
    const reward = await instance.methods.price(USDC.address, amountIn).call();
    assert.equal(
      reward,
      bn(amountIn)
        .mul(bn("10").pow(bn("12")))
        .toString(),
      "Invalid reward"
    );

    await usdcContract.methods
      .approve(instance._address, amountIn)
      .send({from: investor, gas: 2000000});
    await instance.methods.invest(USDC.address, amountIn).send({
      from: investor,
      gas: 2000000,
    });

    const usdcInvestorBalanceEnd = await usdcContract.methods
      .balanceOf(investor)
      .call();
    const usdcInvestmentBalanceEnd = await usdcContract.methods
      .balanceOf(instance._address)
      .call();
    const govInvestorBalanceEnd = await govContract.methods
      .balanceOf(investor)
      .call();
    assert.equal(
      usdcInvestorBalanceEnd,
      bn(usdcInvestorBalanceStart).sub(bn(amountIn)).toString(),
      "Invest tokens should sub"
    );
    assert.equal(
      govInvestorBalanceEnd,
      bn(govInvestorBalanceStart).add(bn(reward)).toString(),
      "Governance tokens should add"
    );
    assert.equal(
      usdcInvestmentBalanceEnd,
      bn(usdcInvestmentBalanceStart).add(bn(amountIn)).toString(),
      "Cumulative tokens should add"
    );
  });
});
