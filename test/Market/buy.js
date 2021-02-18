const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.buy", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {UniswapV2Router02} = development.contracts;
  const uniswap = new web3.eth.Contract(
    UniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, USDT} = development.assets;

  it("buy: should buy product token for cumulative token", async () => {
    const [instance, gov, stable] = await artifacts.requireAll(
      "Market",
      "GovernanceToken",
      "StableToken"
    );
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const startStableToken = bn(10).pow(bn(18)).toString();
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();
    const rewardBalance = "100000";

    await gov.methods
      .mint(instance._address, rewardBalance)
      .send({from: governor});
    await stable.methods
      .mint(instance._address, startStableToken)
      .send({from: governor});
    const customerUSDCStartBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerStableTokenStartBalance = await stable.methods
      .balanceOf(customer)
      .call();
    const customerGovTokenStartBalance = await gov.methods
      .balanceOf(customer)
      .call();
    const marketStableTokenStartBalance = await stable.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(
      customerStableTokenStartBalance,
      "0",
      "Invalid stable token start balance for customer"
    );

    const {product, reward} = await instance.methods
      .price(USDC.address, amount)
      .call();
    await usdc.methods
      .approve(instance._address, amount)
      .send({from: customer});
    await instance.methods
      .buy(USDC.address, amount)
      .send({from: customer, gas: 2000000});

    const customerUSDCEndBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerStableTokenEndBalance = await stable.methods
      .balanceOf(customer)
      .call();
    const customerGovTokenEndBalance = await gov.methods
      .balanceOf(customer)
      .call();
    const marketStableTokenEndBalance = await stable.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(
      customerUSDCEndBalance,
      bn(customerUSDCStartBalance).sub(bn(amount)).toString(),
      "Invalid token end balance for customer"
    );
    assert.equal(
      marketUSDCEndBalance,
      bn(marketUSDCStartBalance).add(bn(amount)).toString(),
      "Invalid token end balance for market"
    );
    assert.equal(
      customerStableTokenEndBalance,
      bn(customerStableTokenStartBalance).add(bn(product)).toString(),
      "Invalid stable token end balance for customer"
    );
    assert.equal(
      customerGovTokenEndBalance,
      bn(customerGovTokenStartBalance).add(bn(reward)).toString(),
      "Invalid gov token end balance for customer"
    );
    assert.equal(
      marketStableTokenEndBalance,
      bn(marketStableTokenStartBalance).sub(bn(product)).toString(),
      "Invalid stable token end balance for market"
    );
  });

  it("buy: should buy stable token for other token", async () => {
    const [instance, stable] = await artifacts.requireAll(
      "Market",
      "StableToken"
    );
    const wbtc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDT.address
    );
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const startStableToken = bn(1000)
      .mul(bn(10).pow(bn(18)))
      .toString();
    const amount = bn(1)
      .mul(bn(10).pow(bn(5)))
      .toString();
    const usdcSwapAmount = (
      await uniswap.methods
        .getAmountsOut(amount, [
          USDT.address,
          await uniswap.methods.WETH().call(),
          USDC.address,
        ])
        .call()
    )[2];

    await stable.methods
      .mint(instance._address, startStableToken)
      .send({from: governor});
    const customerWBTCStartBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerStableTokenStartBalance = await stable.methods
      .balanceOf(customer)
      .call();
    const marketStableTokenStartBalance = await stable.methods
      .balanceOf(instance._address)
      .call();

    const {product} = await instance.methods.price(USDT.address, amount).call();
    await wbtc.methods
      .approve(instance._address, amount)
      .send({from: customer});
    await instance.methods
      .buy(USDT.address, amount)
      .send({from: customer, gas: 2000000});

    const customerWBTCEndBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerStableTokenEndBalance = await stable.methods
      .balanceOf(customer)
      .call();
    const marketStableTokenEndBalance = await stable.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(
      customerWBTCEndBalance,
      bn(customerWBTCStartBalance).sub(bn(amount)).toString(),
      "Invalid token end balance for customer"
    );
    assert.equal(
      marketUSDCEndBalance,
      bn(marketUSDCStartBalance).add(bn(usdcSwapAmount)).toString(),
      "Invalid token end balance for market"
    );
    assert.equal(
      customerStableTokenEndBalance,
      bn(customerStableTokenStartBalance).add(bn(product)).toString(),
      "Invalid stable token end balance for customer"
    );
    assert.equal(
      marketStableTokenEndBalance,
      bn(marketStableTokenStartBalance).sub(bn(product)).toString(),
      "Invalid stable token end balance for market"
    );
  });

  it("buy: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");
    const [, notAllowedToken] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.buy(notAllowedToken, 1).send({from: customer}),
      "Market::price: currency not allowed"
    );
  });
});
