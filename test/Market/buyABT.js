const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.buyABT", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {UniswapV2Router02} = development.contracts;
  const uniswap = new web3.eth.Contract(
    UniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, WBTC} = development.assets;

  it("buyABT: should buy abt token for cumulative token", async () => {
    const [instance, abt] = await artifacts.requireAll("Market", "ABT");
    const usdc = new web3.eth.Contract(
      development.contracts.ABT.abi,
      USDC.address
    );
    const startABT = bn(10).pow(bn(18)).toString();
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();

    await abt.methods.mint(instance._address, startABT).send({from: governor});
    const customerUSDCStartBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerABTStartBalance = await abt.methods
      .balanceOf(customer)
      .call();
    const marketABTStartBalance = await abt.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(
      customerABTStartBalance,
      "0",
      "Invalid abt token start balance for customer"
    );

    const reward = await instance.methods.priceABT(USDC.address, amount).call();
    await usdc.methods
      .approve(instance._address, amount)
      .send({from: customer});
    await instance.methods
      .buyABT(USDC.address, amount)
      .send({from: customer, gas: 2000000});

    const customerUSDCEndBalance = await usdc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerABTEndBalance = await abt.methods.balanceOf(customer).call();
    const marketABTEndBalance = await abt.methods
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
      customerABTEndBalance,
      bn(customerABTStartBalance).add(bn(reward)).toString(),
      "Invalid abt token end balance for customer"
    );
    assert.equal(
      marketABTEndBalance,
      bn(marketABTStartBalance).sub(bn(reward)).toString(),
      "Invalid abt token end balance for market"
    );
  });

  it("buyABT: should buy abt token for other token", async () => {
    const [instance, abt] = await artifacts.requireAll("Market", "ABT");
    const wbtc = new web3.eth.Contract(
      development.contracts.ABT.abi,
      WBTC.address
    );
    const usdc = new web3.eth.Contract(
      development.contracts.ABT.abi,
      USDC.address
    );
    const startABT = bn(1000)
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

    await abt.methods.mint(instance._address, startABT).send({from: governor});
    const customerWBTCStartBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCStartBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerABTStartBalance = await abt.methods
      .balanceOf(customer)
      .call();
    const marketABTStartBalance = await abt.methods
      .balanceOf(instance._address)
      .call();

    const reward = await instance.methods.priceABT(WBTC.address, amount).call();
    await wbtc.methods
      .approve(instance._address, amount)
      .send({from: customer});
    await instance.methods
      .buyABT(WBTC.address, amount)
      .send({from: customer, gas: 2000000});

    const customerWBTCEndBalance = await wbtc.methods
      .balanceOf(customer)
      .call();
    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerABTEndBalance = await abt.methods.balanceOf(customer).call();
    const marketABTEndBalance = await abt.methods
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
      customerABTEndBalance,
      bn(customerABTStartBalance).add(bn(reward)).toString(),
      "Invalid abt token end balance for customer"
    );
    assert.equal(
      marketABTEndBalance,
      bn(marketABTStartBalance).sub(bn(reward)).toString(),
      "Invalid abt token end balance for market"
    );
  });

  it("buyABT: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");
    const notAllowedToken = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.buyABT(notAllowedToken, 1).send({from: customer}),
      "Market::buy: invalid token"
    );
  });
});
