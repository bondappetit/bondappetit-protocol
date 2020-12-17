const assertions = require("truffle-assertions");
const ProfitSplitter = artifacts.require("ProfitSplitter");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("ProfitSplitter.changeBudget", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("changeBudget: should change budget address", async () => {
    const instance = await ProfitSplitter.deployed();
    const contract = Bond.address;
    const balance = '99';

    const startBudgetAddress = await instance.budget();
    const startBudgetBalance = await instance.budgetBalance();
    assert.equal(
        startBudgetAddress != contract,
        true,
        "Invalid start budget address"
    );
    assert.equal(
        startBudgetBalance != balance,
        true,
        "Invalid start budget balance"
    );

    await instance.changeBudget(contract, balance, {from: governor});

    const endBudgetAddress = await instance.budget();
    const endBudgetBalance = await instance.budgetBalance();
    assert.equal(
        endBudgetAddress == contract,
        true,
        "Invalid end budget address"
    );
    assert.equal(
        endBudgetBalance == balance,
        true,
        "Invalid end budget balance"
    );
  });

  it("changeBudget: should revert tx if sender not owner", async () => {
    const instance = await ProfitSplitter.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.changeBudget(governor, 0, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
