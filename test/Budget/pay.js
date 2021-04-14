const {contract, assert, bn} = require("../../utils/test");

contract("Budget.deficit", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const expenditures = {
    [network.contracts.Treasury.address]: {
      min: "5",
      target: "10",
    },
    [network.contracts.Timelock.address]: {
      min: "2",
      target: "4",
    },
  };

  it("pay: should set withdrawal balances for all expenditures", async () => {
    const instance = await artifacts.require("Budget");
    const contractA = network.contracts.Treasury.address;
    const contractB = network.contracts.Timelock.address;
    const amount = bn(expenditures[contractA].target)
      .add(bn(expenditures[contractB].target))
      .toString();

    await web3.eth.sendTransaction({
      from: governor,
      to: instance._address,
      value: amount,
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

    const endBalanceContractA = await instance.methods
      .balanceOf(contractA)
      .call();
    const endBalanceContractB = await instance.methods
      .balanceOf(contractB)
      .call();
    const endTotalSupply = await instance.methods.totalSupply().call();
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
    assert.equal(endTotalSupply, amount, "Invalid end total supply");
  });
});
