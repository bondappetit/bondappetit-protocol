const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("VestingSplitter.split", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("split: should split balance to accounts", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "VestingSplitter",
      "GovernanceToken"
    );
    const [, accountA, accountB] = artifacts.accounts;
    const accounts = [accountA, accountB];
    const shares = ["85", "15"];
    const firstAmount = "1000";
    const secondAmount = "500";

    await instance.methods
      .changeShares(accounts, shares)
      .send({from: governor, gas: 6000000});
    await gov.methods
      .transfer(instance._address, firstAmount)
      .send({from: governor});
    await instance.methods
      .split(gov._address)
      .send({from: governor, gas: 6000000});

    const totalSupplyMiddle = await instance.methods
      .totalSupply(gov._address)
      .call();
    const accountAMiddleBalance = await instance.methods
      .balanceOf(gov._address, accountA)
      .call();
    const accountBMiddleBalance = await instance.methods
      .balanceOf(gov._address, accountB)
      .call();
    const expectedMiddleBalanceOfAccountA = bn(firstAmount)
      .div(bn(100))
      .mul(bn(shares[0]))
      .toString();
    const expectedMiddleBalanceOfAccountB = bn(firstAmount)
      .div(bn(100))
      .mul(bn(shares[1]))
      .toString();
    assert.equal(totalSupplyMiddle, firstAmount, "Invalid middle total supply");
    assert.equal(
      accountAMiddleBalance,
      expectedMiddleBalanceOfAccountA,
      "Invalid account A middle balance"
    );
    assert.equal(
      accountBMiddleBalance,
      expectedMiddleBalanceOfAccountB,
      "Invalid account B middle balance"
    );

    await gov.methods
      .transfer(instance._address, secondAmount)
      .send({from: governor});
    await instance.methods
      .split(gov._address)
      .send({from: governor, gas: 6000000});

    const totalSupplyEnd = await instance.methods
      .totalSupply(gov._address)
      .call();
    const accountAEndBalance = await instance.methods
      .balanceOf(gov._address, accountA)
      .call();
    const accountBEndBalance = await instance.methods
      .balanceOf(gov._address, accountB)
      .call();
    assert.equal(
      totalSupplyEnd,
      bn(firstAmount).add(bn(secondAmount)).toString(),
      "Invalid end total supply"
    );
    assert.equal(
      accountAEndBalance,
      bn(secondAmount)
        .div(bn(100))
        .mul(bn(shares[0]))
        .add(bn(expectedMiddleBalanceOfAccountA))
        .toString(),
      "Invalid first account end balance"
    );
    assert.equal(
      accountBEndBalance,
      bn(secondAmount)
        .div(bn(100))
        .mul(bn(shares[1]))
        .add(bn(expectedMiddleBalanceOfAccountB))
        .toString(),
      "Invalid second account end balance"
    );
  });

  it("split: should revert tx if balance is empty", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "VestingSplitter",
      "GovernanceToken"
    );

    await assertions.reverts(
      instance.methods.split(gov._address).send({from: governor, gas: 6000000}),
      "VestingSplitter::split: empty balance"
    );
  });
});
