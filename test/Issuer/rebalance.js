const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Issuer.rebalance", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("rebalance: should mint ABT", async () => {
    const [
      instance,
      abt,
      treasury,
      depositary,
      security,
    ] = await artifacts.requireAll(
      "Issuer",
      "ABT",
      "Treasury",
      "DepositaryOracle",
      "SecurityOracle"
    );
    const isin = "test bond";
    const amount = "10";
    const nominalValue = bn("1000").mul(bn("10").pow(bn("6")));
    const nominalValueBytes = web3.eth.abi.encodeParameters(
      ["uint256"],
      [nominalValue.toString()]
    );

    await abt.methods
      .transferOwnership(instance._address)
      .send({from: governor});

    const startABTTotalSupply = await abt.methods.totalSupply().call();
    const startABTTreasuryBalance = await abt.methods
      .balanceOf(treasury._address)
      .call();
    assert.equal(startABTTotalSupply, "0", "Invalid start ABT total supply");
    assert.equal(
      startABTTreasuryBalance,
      "0",
      "Invalid start treasury balance"
    );

    await depositary.methods.put(isin, amount).send({from: governor});
    await security.methods.put(isin, "nominalValue", nominalValueBytes).send({
      from: governor,
    });

    const issuerBalance = await instance.methods.balance().call();
    const expectedAmount = bn(amount)
      .mul(bn(nominalValue))
      .mul(bn("10").pow(bn("12")))
      .toString();
    assert.equal(
      issuerBalance,
      expectedAmount.toString(),
      "Invalid issuer balance"
    );

    await instance.methods.rebalance().send({from: governor});

    const middleABTTotalSupply = await abt.methods.totalSupply().call();
    const middleABTTreasuryBalance = await abt.methods
      .balanceOf(treasury._address)
      .call();
    assert.equal(
      middleABTTotalSupply,
      expectedAmount.toString(),
      "Invalid middle ABT total supply"
    );
    assert.equal(
      middleABTTreasuryBalance,
      expectedAmount.toString(),
      "Invalid middle treasury balance"
    );

    await depositary.methods.put(isin, 0).send({from: governor});
    await treasury.methods
      .transfer(abt._address, instance._address, expectedAmount.toString())
      .send({
        from: governor,
      });
    await instance.methods.rebalance().send({from: governor});

    const endABTTotalSupply = await abt.methods.totalSupply().call();
    const endABTTreasuryBalance = await abt.methods
      .balanceOf(treasury._address)
      .call();
    const endABTIssuerBalance = await abt.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(endABTTotalSupply, "0", "Invalid end ABT total supply");
    assert.equal(
      endABTTreasuryBalance,
      "0",
      "Invalid end treasury balance on treasury"
    );
    assert.equal(
      endABTIssuerBalance,
      "0",
      "Invalid end treasury balance on issuer"
    );
  });
});
