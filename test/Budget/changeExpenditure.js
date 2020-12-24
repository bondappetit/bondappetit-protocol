const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Budget.changeExpenditure", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const contract = development.contracts.Bond.address;

  it("changeExpenditure: should change expenditure item", async () => {
    const instance = await artifacts.require("Budget");
    const min = "10";
    const target = "50";

    const startExpenditure = await instance.methods
      .expenditures(contract)
      .call();
    assert.equal(startExpenditure.min, "0", "Invalid start min");
    assert.equal(startExpenditure.target, "0", "Invalid start target");

    await instance.methods
      .changeExpenditure(contract, min, target)
      .send({from: governor});

    const endExpenditure = await instance.methods.expenditures(contract).call();
    assert.equal(endExpenditure.min, min, "Invalid end min");
    assert.equal(endExpenditure.target, target, "Invalid end target");
  });

  it("changeExpenditure: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("Budget");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.changeExpenditure(contract, "0", "0").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
