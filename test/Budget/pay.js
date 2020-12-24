const {utils} = require("web3");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Budget.deficit", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const expenditures = {
    [development.contracts.Treasury.address]: {
      min: "5",
      target: "10",
    },
    [development.contracts.Timelock.address]: {
      min: "2",
      target: "4",
    },
  };

  it("deficit: should return eth balance deficit to all expenditures addresses", async () => {
    const instance = await artifacts.require("Budget");
    const contractA = development.contracts.Treasury.address;
    const contractB = development.contracts.Timelock.address;

    await web3.eth.sendTransaction({
      from: governor,
      to: instance._address,
      value: bn(expenditures[contractA].target)
        .add(bn(expenditures[contractB].target))
        .toString(),
    });
    await instance.methods
      .changeExpenditure(
        contractA,
        expenditures[contractA].min,
        expenditures[contractA].target
      )
      .send({from: governor});
    await instance.methods
      .changeExpenditure(
        contractB,
        expenditures[contractB].min,
        expenditures[contractB].target
      )
      .send({from: governor});

    await instance.methods.pay().send({from: governor});

    const endBalanceContractA = await web3.eth.getBalance(contractA);
    const endBalanceContractB = await web3.eth.getBalance(contractB);
    assert.equal(
      endBalanceContractA,
      expenditures[contractA].target,
      "Invalid end balance to contract A"
    );
    assert.equal(
      endBalanceContractB,
      expenditures[contractB].target,
      "Invalid end balance to contract B"
    );
  });
});
