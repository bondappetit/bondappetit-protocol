const {contract, assert, bn} = require("../../../utils/test");

contract("BuybackDepositaryBalanceView.buy", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const donor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {USDC} = network.assets;

  it("buy: should buyback stable token", async () => {
    const [
      instance,
      collateralMarket,
      stable,
      stableTokenDepositary,
    ] = await artifacts.requireAll(
      "UsdcBuybackDepositaryBalanceView",
      "CollateralMarket",
      "StableToken",
      "StableTokenDepositaryBalanceView"
    );
    const usdc = new web3.eth.Contract(
      network.contracts.Stable.abi,
      USDC.address
    );
    const amount = "100";

    await usdc.methods.transfer(governor, amount).send({from: donor});
    await usdc.methods
      .approve(collateralMarket._address, amount)
      .send({from: governor});
    await collateralMarket.methods
      .buy(USDC.address, amount)
      .send({from: governor, gas: 6000000});
    await stableTokenDepositary.methods
      .transfer(USDC.address, instance._address, amount)
      .send({from: governor, gas: 6000000});
    const startUsdcBalance = await usdc.methods.balanceOf(governor).call();

    assert.equal(
      await instance.methods.balance().call(),
      `100${"0".repeat(12)}`,
      "Invalid start depositary balance"
    );
    assert.equal(
      await usdc.methods.balanceOf(instance._address).call(),
      amount,
      "Invalid start depositary usdc balance"
    );
    assert.equal(
      await stable.methods.totalSupply().call(),
      `100${"0".repeat(12)}`,
      "Invalid start stable total supply"
    );
    assert.equal(
      await stable.methods.balanceOf(governor).call(),
      `100${"0".repeat(12)}`,
      "Invalid start account balance"
    );

    const buy = `${amount}${"0".repeat(12)}`;
    await stable.methods.approve(instance._address, buy).send({from: governor});
    await instance.methods.buy(buy).send({from: governor, gas: 6000000});

    assert.equal(
      await instance.methods.balance().call(),
      "0",
      "Invalid end depositary balance"
    );
    assert.equal(
      await stable.methods.totalSupply().call(),
      "0",
      "Invalid end stable total supply"
    );
    assert.equal(
      await usdc.methods.balanceOf(governor).call(),
      bn(startUsdcBalance).add(bn(amount)).toString(),
      "Invalid end account balance"
    );
  });

  it("buy: should burn unsecured tokens", async () => {
    const [
      instance,
      collateralMarket,
      stable,
      stableTokenDepositary,
    ] = await artifacts.requireAll(
      "UsdcBuybackDepositaryBalanceView",
      "CollateralMarket",
      "StableToken",
      "StableTokenDepositaryBalanceView"
    );
    const usdc = new web3.eth.Contract(
      network.contracts.Stable.abi,
      USDC.address
    );
    const amount = "100";
    const oversupply = "30";

    await usdc.methods.transfer(governor, amount).send({from: donor});
    await usdc.methods
      .approve(collateralMarket._address, amount)
      .send({from: governor});
    await collateralMarket.methods
      .buy(USDC.address, amount)
      .send({from: governor, gas: 6000000});
    await stableTokenDepositary.methods
      .transfer(USDC.address, instance._address, amount)
      .send({from: governor, gas: 6000000});
    await usdc.methods
      .transfer(stableTokenDepositary._address, oversupply)
      .send({from: donor, gas: 6000000});
    const startUsdcBalance = await usdc.methods.balanceOf(governor).call();

    const buy = `${amount}${"0".repeat(12)}`;
    await stable.methods.approve(instance._address, buy).send({from: governor});
    await instance.methods.buy(buy).send({from: governor, gas: 6000000});

    assert.equal(
      await stableTokenDepositary.methods.balance().call(),
      `${oversupply}${"0".repeat(12)}`,
      "Invalid end depositary balance"
    );
    assert.equal(
      await stable.methods.totalSupply().call(),
      `${oversupply}${"0".repeat(12)}`,
      "Invalid end stable total supply"
    );
    assert.equal(
      await usdc.methods.balanceOf(governor).call(),
      bn(startUsdcBalance).add(bn(amount)).toString(),
      "Invalid end account balance"
    );
  });
});
