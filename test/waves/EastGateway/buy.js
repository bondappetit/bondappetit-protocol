const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("EastGateway.buy", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {USDC} = development.assets;

  it("buy: should buy product token and transfer to recipient", async () => {
    const [instance, market, gov, stable] = await artifacts.requireAll(
      "EastGateway",
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
      .mint(market._address, rewardBalance)
      .send({from: governor});
    await stable.methods
      .mint(market._address, startStableToken)
      .send({from: governor});
    const customerUSDCStartBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(market._address)
      .call();
    const customerStableTokenStartBalance = await stable.methods
      .balanceOf(customer)
      .call();
    const customerGovTokenStartBalance = await gov.methods
      .balanceOf(customer)
      .call();
    const recipientStableTokenStartBalance = await stable.methods
      .balanceOf(governor)
      .call();
    const marketStableTokenStartBalance = await stable.methods
      .balanceOf(market._address)
      .call();
    assert.equal(
      customerStableTokenStartBalance,
      "0",
      "Invalid stable token start balance for customer"
    );

    const {product, reward} = await market.methods
      .price(USDC.address, amount)
      .call();
    await usdc.methods
      .approve(instance._address, amount)
      .send({from: customer});
    await instance.methods
      .buy(USDC.address, amount, product)
      .send({from: customer, gas: 2000000});
    const customerUSDCEndBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(market._address)
      .call();
    const customerStableTokenEndBalance = await stable.methods
      .balanceOf(customer)
      .call();
    const customerGovTokenEndBalance = await gov.methods
      .balanceOf(customer)
      .call();
    const recipientStableTokenEndBalance = await stable.methods
      .balanceOf(governor)
      .call();
    const marketStableTokenEndBalance = await stable.methods
      .balanceOf(market._address)
      .call();
    const gatewayUSDCEndBalance = await stable.methods
      .balanceOf(instance._address)
      .call();
    const gatewayStableTokenEndBalance = await stable.methods
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
      customerStableTokenStartBalance,
      "Invalid stable token end balance for customer"
    );
    assert.equal(
      recipientStableTokenEndBalance,
      bn(recipientStableTokenStartBalance).add(bn(product)).toString(),
      "Invalid stable token end balance for recipient"
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
    assert.equal(
      gatewayStableTokenEndBalance,
      "0",
      "Invalid stable token end balance for gateway"
    );
    assert.equal(
      gatewayUSDCEndBalance,
      "0",
      "Invalid token end balance for gateway"
    );
  });
});
