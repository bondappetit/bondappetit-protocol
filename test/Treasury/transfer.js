const assertions = require("truffle-assertions");
const Bond = artifacts.require("Bond");
const Treasury = artifacts.require("Treasury");
const {development} = require("../../networks");

contract("Treasury", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("transfer: should transfer target token", async () => {
    const instance = await Treasury.deployed();
    const bond = await Bond.deployed();
    const accountWithoutTokens = accounts[1];
    const amount = 10;

    await bond.transfer(Treasury.address, amount, {from: governor});
    const startTreasuryBalance = await bond.balanceOf(Treasury.address);
    const startAccountBalance = await bond.balanceOf(accountWithoutTokens);
    assert.equal(
      amount.toString(),
      startTreasuryBalance.toString(),
      "Invalid start treasury balance"
    );
    assert.equal(
      "0",
      startAccountBalance.toString(),
      "Invalid start account balance"
    );

    await instance.transfer(Bond.address, accountWithoutTokens, amount, {
      from: governor,
    });
    const endTreasuryBalance = await bond.balanceOf(Treasury.address);
    const endAccountBalance = await bond.balanceOf(accountWithoutTokens);
    assert.equal(
      "0",
      endTreasuryBalance.toString(),
      "Invalid end treasury balance"
    );
    assert.equal(
      amount.toString(),
      endAccountBalance.toString(),
      "Invalid end account balance"
    );
  });

  it("transfer: should revert tx if called is not the owner", async () => {
    const instance = await Treasury.deployed();

    await assertions.reverts(
      instance.transfer(Bond.address, governor, 10, {from: accounts[1]}),
      "Ownable: caller is not the owner."
    );
  });
});