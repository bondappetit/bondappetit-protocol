const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("UniV2BuybackDepositaryBalanceView.buy", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const usdcHolder = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {
    contracts: {UniswapV2Router02},
    assets: {USDC},
  } = development;

  it("buy: should buyback stable token and rebalance issuer", async () => {
    const [
      instance,
      issuer,
      treasury,
      stableToken,
      stableTokenDepositary,
    ] = await artifacts.requireAll(
      "UniV2BuybackDepositaryBalanceView",
      "Issuer",
      "Treasury",
      "StableToken",
      "StableTokenDepositaryBalanceView"
    );
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const router = new web3.eth.Contract(
      UniswapV2Router02.abi,
      UniswapV2Router02.address
    );
    const collateral = `1000${"0".repeat(6)}`;
    const usdcLiquidityReserve = `100${"0".repeat(6)}`;
    const stableLiquidityReserve = `100${"0".repeat(18)}`;
    const stableSwapAmount = `10${"0".repeat(18)}`;
    const usdcBuybackAmount = `10${"0".repeat(6)}`;

    await issuer.methods
      .addDepositary(instance._address)
      .send({from: governor});
    await usdc.methods
      .transfer(stableTokenDepositary._address, collateral)
      .send({from: usdcHolder});
    await usdc.methods
      .transfer(governor, usdcLiquidityReserve)
      .send({from: usdcHolder});
    await issuer.methods.rebalance().send({from: governor, gas: 2000000});
    const stableTokenAmount = await stableToken.methods
      .balanceOf(treasury._address)
      .call();
    await treasury.methods
      .transfer(stableToken._address, governor, stableTokenAmount)
      .send({from: governor});
    await usdc.methods
      .approve(router._address, usdcLiquidityReserve)
      .send({from: governor});
    await stableToken.methods
      .approve(router._address, stableLiquidityReserve)
      .send({from: governor});
    await router.methods
      .addLiquidity(
        usdc._address,
        stableToken._address,
        usdcLiquidityReserve,
        stableLiquidityReserve,
        "0",
        "0",
        governor,
        Date.now()
      )
      .send({from: governor, gas: 2000000});
    const path = [stableToken._address, usdc._address];
    await stableToken.methods
      .approve(router._address, stableSwapAmount)
      .send({from: governor});
    await router.methods
      .swapExactTokensForTokens(
        stableSwapAmount,
        (
          await router.methods
            .getAmountsOut(stableSwapAmount, path)
            .call({from: governor})
        )[1],
        path,
        governor,
        Date.now()
      )
      .send({from: governor, gas: 2000000});

    const [, startPrice] = await router.methods
      .getAmountsOut(`1${"0".repeat(18)}`, path)
      .call({from: governor});
    const startTotalSupply = await stableToken.methods.totalSupply().call();
    assert.equal(parseInt(startPrice, 10) < 1e6, true, "Invalid start price");

    await stableTokenDepositary.methods
      .transfer(usdc._address, instance._address, usdcBuybackAmount)
      .send({from: governor});
    await instance.methods
      .buy(usdcBuybackAmount)
      .send({from: governor, gas: 2000000});

    const [, endPrice] = await router.methods
      .getAmountsOut(`1${"0".repeat(18)}`, path)
      .call({from: governor});
    const endTotalSupply = await stableToken.methods.totalSupply().call();

    assert.equal(
      parseInt(endPrice, 10) > parseInt(startPrice, 10),
      true,
      "Invalid end price"
    );
    assert.equal(
      parseInt(endTotalSupply, 10) < parseInt(startTotalSupply, 10),
      true,
      "Invalid end stable token total supply"
    );
  });

  it("buy: should revert tx if invalid price", async () => {
    const [instance, stableToken] = await artifacts.requireAll(
      "UniV2BuybackDepositaryBalanceView",
      "StableToken"
    );
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const router = new web3.eth.Contract(
      UniswapV2Router02.abi,
      UniswapV2Router02.address
    );
    const usdcSwapAmount = `10${"0".repeat(6)}`;
    const path = [usdc._address, stableToken._address];

    await usdc.methods
      .approve(router._address, usdcSwapAmount)
      .send({from: governor});
    await router.methods
      .swapExactTokensForTokens(
        usdcSwapAmount,
        (
          await router.methods
            .getAmountsOut(usdcSwapAmount, path)
            .call({from: governor})
        )[1],
        path,
        governor,
        Date.now()
      )
      .send({from: governor, gas: 2000000});

    await assertions.reverts(
      instance.methods.buy(`1${"0".repeat(6)}`).send({
        from: governor,
      }),
      "UniV2BuybackDepositaryBalanceView::buy: invalid price"
    );
  });

  it("buy: should revert tx if invalid amount", async () => {
    const instance = await artifacts.require(
      "UniV2BuybackDepositaryBalanceView"
    );

    await assertions.reverts(
      instance.methods.buy(0).send({
        from: governor,
      }),
      "UniV2BuybackDepositaryBalanceView::buy: zero amount"
    );
  });

  it("buy: should revert tx if sender not owner or caller", async () => {
    const instance = await artifacts.require(
      "UniV2BuybackDepositaryBalanceView"
    );
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.buy(0).send({
        from: notOwner,
      }),
      "UniV2BuybackDepositaryBalanceView::buy: invalid caller"
    );
  });
});
