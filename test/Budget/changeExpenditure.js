const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Budget.changeExpenditure", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const contract = development.contracts.Treasury.address;
  const min = "10";
  const target = "20";

  it("changeExpenditure: should change expenditure item", async () => {
    const instance = await artifacts.require("Budget");

    const startExpenditure = await instance.methods
      .expenditures(contract)
      .call();
    const startRecipients = await instance.methods.getRecipients().call();
    assert.equal(startExpenditure.min, "0", "Invalid start min");
    assert.equal(startExpenditure.target, "0", "Invalid start target");
    assert.equal(
      startRecipients.includes(contract),
      false,
      "Invalid start recipients list"
    );

    await instance.methods
      .changeExpenditure(contract, min, target)
      .send({from: governor});

    const endExpenditure = await instance.methods.expenditures(contract).call();
    const endRecipients = await instance.methods.getRecipients().call();
    assert.equal(endExpenditure.min, min, "Invalid end min");
    assert.equal(endExpenditure.target, target, "Invalid end target");
    assert.equal(
      endRecipients.includes(contract),
      true,
      "Invalid end recipients list"
    );
  });

  it("changeExpenditure: should save withdrawal balance for removed recipient", async () => {
    const instance = await artifacts.require("Budget");

    const deficit = await instance.methods.deficitTo(contract).call();
    await web3.eth.sendTransaction({
      from: governor,
      to: instance._address,
      value: deficit,
    });
    await instance.methods.pay().send({from: governor, gas: 6000000});

    const startBalance = await instance.methods.balanceOf(contract).call();
    const startTotalSupply = await instance.methods.totalSupply().call();
    assert.equal(startBalance, target, "Invalid start balance");
    assert.equal(startTotalSupply, target, "Invalid start total supply");

    await instance.methods
      .changeExpenditure(contract, "0", "0")
      .send({from: governor});

    const endExpenditure = await instance.methods.expenditures(contract).call();
    const endRecipients = await instance.methods.getRecipients().call();
    const endBalance = await instance.methods.balanceOf(contract).call();
    const endTotalSupply = await instance.methods.totalSupply().call();
    assert.equal(endExpenditure.min, "0", "Invalid end min");
    assert.equal(endExpenditure.target, "0", "Invalid end target");
    assert.equal(
      endRecipients.includes(contract),
      false,
      "Invalid end recipients list"
    );
    assert.equal(endBalance, startBalance, "Invalid end balance");
    assert.equal(endTotalSupply, startTotalSupply, "Invalid end total supply");
  });

  it("changeExpenditure: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("Budget");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeExpenditure(contract, "0", "0").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
