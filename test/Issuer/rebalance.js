const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Issuer.rebalance", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const isin = "test bond";
  const amount = "10";
  const nominalValue = bn("1000").mul(bn("10").pow(bn("6")));
  const expectedAmount = bn(amount)
    .mul(bn(nominalValue))
    .mul(bn("10").pow(bn("12")))
    .toString();

  it("rebalance: should mint stable token", async () => {
    const [instance, stable, treasury, depositary] = await artifacts.requireAll(
      "Issuer",
      "StableToken",
      "Treasury",
      "RealAssetDepositaryBalanceView"
    );

    const startStableTokenTotalSupply = await stable.methods
      .totalSupply()
      .call();
    const startStableTokenTreasuryBalance = await stable.methods
      .balanceOf(treasury._address)
      .call();
    assert.equal(
      startStableTokenTotalSupply,
      "0",
      "Invalid start stable token total supply"
    );
    assert.equal(
      startStableTokenTreasuryBalance,
      "0",
      "Invalid start treasury balance"
    );

    await depositary.methods
      .put(
        isin,
        amount,
        nominalValue.toString(),
        Date.now(),
        "data",
        "signature"
      )
      .send({from: governor});

    const issuerBalance = await instance.methods.balance().call();
    assert.equal(
      issuerBalance,
      expectedAmount.toString(),
      "Invalid issuer balance"
    );

    await instance.methods.rebalance().send({from: governor, gas: 6000000});

    const endStableTokenTotalSupply = await stable.methods.totalSupply().call();
    const endStableTokenTreasuryBalance = await stable.methods
      .balanceOf(treasury._address)
      .call();
    assert.equal(
      endStableTokenTotalSupply,
      expectedAmount.toString(),
      "Invalid middle stable token total supply"
    );
    assert.equal(
      endStableTokenTreasuryBalance,
      expectedAmount.toString(),
      "Invalid middle treasury balance"
    );
  });

  it("rebalance: should burn stable token", async () => {
    const [instance, stable, treasury, depositary] = await artifacts.requireAll(
      "Issuer",
      "StableToken",
      "Treasury",
      "RealAssetDepositaryBalanceView"
    );

    await depositary.methods.remove(isin).send({from: governor, gas: 6000000});
    await treasury.methods
      .transfer(stable._address, instance._address, expectedAmount)
      .send({from: governor});
    await instance.methods.rebalance().send({from: governor, gas: 6000000});

    const endStableTokenTotalSupply = await stable.methods.totalSupply().call();
    const endStableTokenTreasuryBalance = await stable.methods
      .balanceOf(treasury._address)
      .call();
    const endStableTokenIssuerBalance = await stable.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(
      endStableTokenTotalSupply,
      "0",
      "Invalid end stable token total supply"
    );
    assert.equal(
      endStableTokenTreasuryBalance,
      "0",
      "Invalid end treasury balance on treasury"
    );
    assert.equal(
      endStableTokenIssuerBalance,
      "0",
      "Invalid end treasury balance on issuer"
    );
  });
});
