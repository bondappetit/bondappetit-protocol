const assertions = require("truffle-assertions");
const Budget = artifacts.require("Budget");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("Budget.changeExpenditure", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("changeExpenditure: should change expenditure item", async () => {
    const instance = await Budget.deployed();
    const contract = Bond.address;
    const min = "10";
    const target = "50";

    const startExpenditure = await instance.expenditures(contract);
    assert.equal(startExpenditure.min.toString(), "0", "Invalid start min");
    assert.equal(
      startExpenditure.target.toString(),
      "0",
      "Invalid start target"
    );

    await instance.changeExpenditure(contract, min, target, {from: governor});

    const endExpenditure = await instance.expenditures(contract);
    assert.equal(endExpenditure.min.toString(), min, "Invalid end min");
    assert.equal(
      endExpenditure.target.toString(),
      target,
      "Invalid end target"
    );
  });

  it("changeExpenditure: should revert tx if sender not owner", async () => {
    const instance = await Budget.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.changeExpenditure(Bond.address, '0', '0', {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
