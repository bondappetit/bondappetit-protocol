const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.buyBond", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {UniswapV2Router02} = development.contracts;
  const uniswap = new web3.eth.Contract(
    UniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, WBTC} = development.assets;

  it("buyBond: should buy bond token for cumulative token", async () => {
    const [instance, bond] = await artifacts.requireAll("Market", "Bond");
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const startBond = bn(10).pow(bn(18)).toString();
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();

    await bond.methods.transfer(customer, 1).send({from: governor});

    await bond.methods
      .mint(instance._address, startBond)
      .send({from: governor});
    const customerUSDCStartBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerBondStartBalance = await bond.methods
      .balanceOf(customer)
      .call();
    const marketBondStartBalance = await bond.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(
      customerBondStartBalance,
      "1",
      "Invalid bond token start balance for customer"
    );

    const reward = await instance.methods
      .priceBond(USDC.address, amount)
      .call();
    await usdc.methods.approve(instance._address, amount).send({from: customer});
    await instance.methods
      .buyBond(USDC.address, amount)
      .send({from: customer, gas: 2000000});

    const customerUSDCEndBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerBondEndBalance = await bond.methods
      .balanceOf(customer)
      .call();
    const marketBondEndBalance = await bond.methods
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
      customerBondEndBalance,
      bn(customerBondStartBalance).add(bn(reward)).toString(),
      "Invalid bond token end balance for customer"
    );
    assert.equal(
      marketBondEndBalance,
      bn(marketBondStartBalance).sub(bn(reward)).toString(),
      "Invalid bond token end balance for market"
    );
  });

  it("buyBond: should buy bond token for other token", async () => {
    const [instance, bond] = await artifacts.requireAll("Market", "Bond");
    const wbtc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      WBTC.address
    );
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const startBond = bn(1000)
      .mul(bn(10).pow(bn(18)))
      .toString();
    const amount = bn(1)
      .mul(bn(10).pow(bn(5)))
      .toString();
    const usdcSwapAmount = (
      await uniswap.methods
        .getAmountsOut(amount, [
          WBTC.address,
          await uniswap.methods.WETH().call(),
          USDC.address,
        ])
        .call()
    )[2];

    await bond.methods
      .mint(instance._address, startBond)
      .send({from: governor});
    const customerWBTCStartBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerBondStartBalance = await bond.methods
      .balanceOf(customer)
      .call();
    const marketBondStartBalance = await bond.methods
      .balanceOf(instance._address)
      .call();

    const reward = await instance.methods
      .priceBond(WBTC.address, amount)
      .call();
    await wbtc.methods.approve(instance._address, amount).send({from: customer});
    await instance.methods
      .buyBond(WBTC.address, amount)
      .send({from: customer, gas: 2000000});

    const customerWBTCEndBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerBondEndBalance = await bond.methods
      .balanceOf(customer)
      .call();
    const marketBondEndBalance = await bond.methods
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
      customerBondEndBalance,
      bn(customerBondStartBalance).add(bn(reward)).toString(),
      "Invalid bond token end balance for customer"
    );
    assert.equal(
      marketBondEndBalance,
      bn(marketBondStartBalance).sub(bn(reward)).toString(),
      "Invalid bond token end balance for market"
    );
  });

  it("buyBond: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");
    const notAllowedToken = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.buyBond(notAllowedToken, 1).send({from: customer}),
      "Market::buy: invalid token"
    );
  });

  it("buyBond: should revert tx if customer not tokenholder", async () => {
    const instance = await artifacts.require("Market");
    const notTokenholder = (await web3.eth.getAccounts())[1];
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const amount = "1";

    await usdc.methods.transfer(notTokenholder, amount).send({from: customer});

    await assertions.reverts(
      instance.methods
        .buyBond(USDC.address, amount)
        .send({from: notTokenholder}),
      "Market::buyBond: only tokenholder can buy new bond tokens"
    );
  });
});
