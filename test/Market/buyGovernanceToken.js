const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.buyGovernanceToken", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {UniswapV2Router02} = development.contracts;
  const uniswap = new web3.eth.Contract(
    UniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, USDT} = development.assets;

  it("buyGovernanceToken: should buy governance token for cumulative token", async () => {
    const [instance, gov] = await artifacts.requireAll("Market", "GovernanceToken");
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const startGov = bn(10).pow(bn(18)).toString();
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();

    await gov.methods.transfer(customer, 1).send({from: governor});

    await gov.methods
      .mint(instance._address, startGov)
      .send({from: governor});
    const customerUSDCStartBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerGovStartBalance = await gov.methods
      .balanceOf(customer)
      .call();
    const marketGovStartBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(
      customerGovStartBalance,
      "1",
      "Invalid governance token start balance for customer"
    );

    const reward = await instance.methods
      .priceGovernanceToken(USDC.address, amount)
      .call();
    await usdc.methods.approve(instance._address, amount).send({from: customer});
    await instance.methods
      .buyGovernanceToken(USDC.address, amount)
      .send({from: customer, gas: 2000000});

    const customerUSDCEndBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerGovernanceTokenEndBalance = await gov.methods
      .balanceOf(customer)
      .call();
    const marketGovernanceTokenEndBalance = await gov.methods
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
      customerGovernanceTokenEndBalance,
      bn(customerGovStartBalance).add(bn(reward)).toString(),
      "Invalid governance token end balance for customer"
    );
    assert.equal(
      marketGovernanceTokenEndBalance,
      bn(marketGovStartBalance).sub(bn(reward)).toString(),
      "Invalid governance token end balance for market"
    );
  });

  it("buyGovernanceToken: should buy governance token for other token", async () => {
    const [instance, gov] = await artifacts.requireAll("Market", "GovernanceToken");
    const wbtc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDT.address
    );
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const startGov = bn(1000)
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

    await gov.methods
      .mint(instance._address, startGov)
      .send({from: governor});
    const customerWBTCStartBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerGovStartBalance = await gov.methods
      .balanceOf(customer)
      .call();
    const marketGovStartBalance = await gov.methods
      .balanceOf(instance._address)
      .call();

    const reward = await instance.methods
      .priceGovernanceToken(USDT.address, amount)
      .call();
    await wbtc.methods.approve(instance._address, amount).send({from: customer});
    await instance.methods
      .buyGovernanceToken(USDT.address, amount)
      .send({from: customer, gas: 2000000});

    const customerWBTCEndBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerGovEndBalance = await gov.methods
      .balanceOf(customer)
      .call();
    const marketGovEndBalance = await gov.methods
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
      customerGovEndBalance,
      bn(customerGovStartBalance).add(bn(reward)).toString(),
      "Invalid governance token end balance for customer"
    );
    assert.equal(
      marketGovEndBalance,
      bn(marketGovStartBalance).sub(bn(reward)).toString(),
      "Invalid governance token end balance for market"
    );
  });

  it("buyGovernanceToken: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");
    const [, notAllowedToken] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.buyGovernanceToken(notAllowedToken, 1).send({from: customer}),
      "Market::buy: invalid token"
    );
  });

  it("buyGovernanceToken: should revert tx if customer not tokenholder", async () => {
    const instance = await artifacts.require("Market");
    const [, notTokenholder] = artifacts.accounts;
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const amount = "1";

    await usdc.methods.transfer(notTokenholder, amount).send({from: customer});

    await assertions.reverts(
      instance.methods
        .buyGovernanceToken(USDC.address, amount)
        .send({from: notTokenholder}),
      "Market::buyGovernanceToken: only tokenholder can buy new governance token"
    );
  });
});
