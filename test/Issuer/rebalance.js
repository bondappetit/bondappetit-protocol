const {utils} = require("web3");
const ABT = artifacts.require("ABT");
const Treasury = artifacts.require("Treasury");
const Issuer = artifacts.require("Issuer");
const DepositaryOracle = artifacts.require("oracle/DepositaryOracle");
const SecurityOracle = artifacts.require("oracle/SecurityOracle");
const {development} = require("../../networks");

contract("Issuer", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("rebalance: should mint ABT", async () => {
    const instance = await Issuer.deployed();
    const abt = await ABT.deployed();
    const treasury = await Treasury.deployed();
    const depositary = await DepositaryOracle.deployed();
    const security = await SecurityOracle.deployed();
    const isin = "test bond";
    const amount = 10;
    const nominalValue = utils
      .toBN(1000)
      .mul(utils.toBN(10).pow(utils.toBN(6)));
    const nominalValueBytes = web3.eth.abi.encodeParameters(
      ["uint256"],
      [nominalValue.toString()]
    );

    await abt.transferOwnership(Issuer.address, {from: governor});

    const startABTTotalSupply = await abt.totalSupply();
    const startABTTreasuryBalance = await abt.balanceOf(Treasury.address);
    assert.equal(
      "0",
      startABTTotalSupply.toString(),
      "Invalid start ABT total supply"
    );
    assert.equal(
      "0",
      startABTTreasuryBalance.toString(),
      "Invalid start treasury balance"
    );

    await depositary.put(isin, amount, {from: governor});
    await security.put(isin, "nominalValue", nominalValueBytes, {
      from: governor,
    });

    const issuerBalance = await instance.balance();
    const expectedAmount = utils
      .toBN(amount)
      .mul(nominalValue)
      .mul(utils.toBN(10).pow(utils.toBN(12)))
      .toString();
    assert.equal(
      expectedAmount,
      issuerBalance.toString(),
      "Invalid issuer balance"
    );

    await instance.rebalance({from: governor});

    const middleABTTotalSupply = await abt.totalSupply();
    const middleABTTreasuryBalance = await abt.balanceOf(Treasury.address);
    assert.equal(
      expectedAmount,
      middleABTTotalSupply.toString(),
      "Invalid middle ABT total supply"
    );
    assert.equal(
      expectedAmount,
      middleABTTreasuryBalance.toString(),
      "Invalid middle treasury balance"
    );

    await depositary.put(isin, 0, {from: governor});
    await treasury.transfer(ABT.address, Issuer.address, expectedAmount, {from: governor});
    await instance.rebalance({from: governor});

    const endABTTotalSupply = await abt.totalSupply();
    const endABTTreasuryBalance = await abt.balanceOf(Treasury.address);
    const endABTIssuerBalance = await abt.balanceOf(Issuer.address);
    assert.equal(
      '0',
      endABTTotalSupply.toString(),
      "Invalid end ABT total supply"
    );
    assert.equal(
      '0',
      endABTTreasuryBalance.toString(),
      "Invalid end treasury balance on treasury"
    );
    assert.equal(
      '0',
      endABTIssuerBalance.toString(),
      "Invalid end treasury balance on issuer"
    );
  });
});
