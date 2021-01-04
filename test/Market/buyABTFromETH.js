const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.buyABTFromETH", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {UniswapV2Router02} = development.contracts;
  const uniswap = new web3.eth.Contract(
    UniswapV2Router02.abi,
    UniswapV2Router02.address
  );
  const {USDC, WETH} = development.assets;

  it("buyABTFromETH: should buy abt token", async () => {
    const [instance, abt] = await artifacts.requireAll("Market", "ABT");
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const startABT = bn("1000")
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

    await abt.methods.mint(instance._address, startABT).send({from: governor, gas: 2000000});
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

    const reward = await instance.methods.priceABT(WETH.address, amount).call();
    await instance.methods
      .buyABTFromETH()
      .send({value: amount, from: customer, gas: 2000000});

    const marketUSDCEndBalance = await usdc.methods
      .balanceOf(instance._address)
      .call();
    const customerABTEndBalance = await abt.methods.balanceOf(customer).call();
    const marketABTEndBalance = await abt.methods.balanceOf(instance._address).call();
    assert.equal(
      marketUSDCEndBalance.toString(),
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

  it("buyABTFromETH: should revert tx if token is not allowed", async () => {
    const instance = await artifacts.require("Market");

    await instance.methods.denyToken(WETH.address).send({from: governor});
    await assertions.reverts(
      instance.methods.buyABTFromETH().send({from: governor, value: 1}),
      "Market::buyFromETH: invalid token"
    );
  });
});
