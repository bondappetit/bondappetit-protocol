const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.buyBondFromETH", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {UniswapV2Router02} = development.contracts;
  const uniswap = new web3.eth.Contract(
    UniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, WETH} = development.assets;

  it("buyBondFromETH: should buy bond token", async () => {
    const [instance, bond] = await artifacts.requireAll("Market", "Bond");
    const usdc = new web3.eth.Contract(
      development.contracts.ABT.abi,
      USDC.address
    );
    const startBond = bn("1000")
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

    await bond.methods.transfer(customer, 1).send({from: governor, gas: 2000000});

    await bond.methods
      .mint(instance._address, startBond)
      .send({from: governor, gas: 2000000});
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
      .priceBond(WETH.address, amount)
      .call();
    await instance.methods
      .buyBondFromETH()
      .send({value: amount, from: customer, gas: 2000000});

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

  it("buyBondFromETH: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");

    await instance.methods.denyToken(WETH.address).send({from: governor});
    await assertions.reverts(
      instance.methods.buyBondFromETH().send({value: 1, from: customer}),
      "Market::buyFromETH: invalid token"
    );
  });

  it("buyBondFromETH: should revert tx if customer not tokenholder", async () => {
    const instance = await artifacts.require("Market");
    const notTokenholder = (await web3.eth.getAccounts())[1];

    await instance.methods
      .allowToken(WETH.address, "ETH")
      .send({from: governor});

    await assertions.reverts(
      instance.methods.buyBondFromETH().send({value: 1, from: notTokenholder}),
      "Market::buyBondFromETH: only tokenholder can buy new bond tokens"
    );
  });
});
