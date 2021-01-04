const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("ProfitSplitter.changeBudget", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeBudget: should change budget address", async () => {
    const instance = await artifacts.require("ProfitSplitter");
    const contract = development.contracts.Governance.address;
    const balance = "99";

    const startBudgetAddress = await instance.methods.budget().call();
    const startBudgetBalance = await instance.methods.budgetBalance().call();
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

    await instance.methods
      .changeBudget(contract, balance)
      .send({from: governor});

    const endBudgetAddress = await instance.methods.budget().call();
    const endBudgetBalance = await instance.methods.budgetBalance().call();
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
    const instance = await artifacts.require("ProfitSplitter");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.changeBudget(governor, 0).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
