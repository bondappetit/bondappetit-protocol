const assertions = require("truffle-assertions");
const Bond = artifacts.require("Bond");
const Treasury = artifacts.require("Treasury");
const {development} = require("../../networks");

contract("Treasury.approve", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("approve: should approve target token", async () => {
    const instance = await Treasury.deployed();
    const bond = await Bond.deployed();
    const accountWithoutTokens = accounts[1];
    const amount = 10;

    await bond.transfer(Treasury.address, amount, {from: governor});
    const startAccountAllowance = await bond.allowance(Treasury.address, accountWithoutTokens);
    assert.equal(
      startAccountAllowance.toString(),
      "0",
      "Invalid start account allowance"
    );

    await instance.approve(Bond.address, accountWithoutTokens, amount, {
      from: governor,
    });
    const endAccountAllowance = await bond.allowance(Treasury.address, accountWithoutTokens);
    assert.equal(
      endAccountAllowance.toString(),
      amount.toString(),
      "Invalid end account allowance"
    );
  });

  it("approve: should revert tx if called is not the owner", async () => {
    const instance = await Treasury.deployed();

    await assertions.reverts(
      instance.approve(Bond.address, governor, 10, {from: accounts[1]}),
      "Ownable: caller is not the owner."
    );
  });
});
