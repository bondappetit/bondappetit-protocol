const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.buyFromETH", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {UniswapV2Router02} = development.contracts;
  const uniswap = new web3.eth.Contract(
    UniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, WETH} = development.assets;

  it("buyFromETH: should buy stable token", async () => {
    const [instance, gov, stable] = await artifacts.requireAll(
      "Market",
      "GovernanceToken",
      "StableToken"
    );
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const startStableToken = bn("1000")
      .mul(bn(10).pow(bn(18)))
      .toString();
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();
    const usdcSwapAmount = (
      await uniswap.methods
        .getAmountsOut(amount, [
          await uniswap.methods.WETH().call(),
          USDC.address,
        ])
        .call()
    )[1];
    const rewardBalance = "100000";

    await gov.methods
      .mint(instance._address, rewardBalance)
      .send({from: governor});
    await stable.methods
      .mint(instance._address, startStableToken)
      .send({from: governor, gas: 2000000});
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
      .price(WETH.address, amount)
      .call();
    await instance.methods
      .buyFromETH()
      .send({value: amount, from: customer, gas: 2000000});

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
      marketUSDCEndBalance.toString(),
      bn(marketUSDCStartBalance).add(bn(usdcSwapAmount)).toString(),
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

  it("buyFromETH: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");

    await instance.methods.denyToken(WETH.address).send({from: governor});
    await assertions.reverts(
      instance.methods.buyFromETH().send({from: governor, value: 1}),
      "Market::price: currency not allowed"
    );
  });
});
