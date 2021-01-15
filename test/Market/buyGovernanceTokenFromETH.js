const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.buyGovernanceTokenFromETH", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {UniswapV2Router02} = development.contracts;
  const uniswap = new web3.eth.Contract(
    UniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, WETH} = development.assets;

  it("buyGovernanceTokenFromETH: should buy governance token", async () => {
    const [instance, gov] = await artifacts.requireAll("Market", "GovernanceToken");
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const startGov = bn("1000")
      .mul(bn(10).pow(bn(18)))
      .toString();
    const amount = bn(1)
      .mul(bn(10).pow(bn(18)))
      .toString();
    const usdcSwapAmount = (
      await uniswap.methods
        .getAmountsOut(amount, [
          await uniswap.methods.WETH().call(),
          USDC.address,
        ])
        .call()
    )[1];

    await gov.methods.transfer(customer, 1).send({from: governor, gas: 2000000});

    await gov.methods
      .mint(instance._address, startGov)
      .send({from: governor, gas: 2000000});
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
      .priceGovernanceToken(WETH.address, amount)
      .call();
    await instance.methods
      .buyGovernanceTokenFromETH()
      .send({value: amount, from: customer, gas: 2000000});

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

  it("buyGovernanceTokenFromETH: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");

    await instance.methods.denyToken(WETH.address).send({from: governor});
    await assertions.reverts(
      instance.methods.buyGovernanceTokenFromETH().send({value: 1, from: customer}),
      "Market::buyFromETH: invalid token"
    );
  });

  it("buyGovernanceTokenFromETH: should revert tx if customer not tokenholder", async () => {
    const instance = await artifacts.require("Market");
    const [, notTokenholder] = artifacts.accounts;

    await instance.methods
      .allowToken(WETH.address, "ETH")
      .send({from: governor});

    await assertions.reverts(
      instance.methods.buyGovernanceTokenFromETH().send({value: 1, from: notTokenholder}),
      "Market::buyGovernanceTokenFromETH: only tokenholder can buy new governance token"
    );
  });
});
