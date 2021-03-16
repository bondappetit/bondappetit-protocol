const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Budget.deficit", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const expenditures = {
    [development.contracts.Treasury.address]: {
      min: "5",
      target: "8",
    },
    [development.contracts.Timelock.address]: {
      min: "2",
      target: "4",
    },
  };

  it("deficitTo: should return eth balance deficit to target address", async () => {
    const instance = await artifacts.require("Budget");
    const contract = await artifacts.require("Treasury");
    const contractAddress = development.contracts.Treasury.address;
    const {min, target} = expenditures[contractAddress];

    const contractBalance = await web3.eth.getBalance(contractAddress);
    if (contractBalance > 0) {
      await contract.methods
        .transferETH(instance._address, contractBalance)
        .send({from: governor});
    }

    await instance.methods
      .changeExpenditure(contractAddress, min, target)
      .send({from: governor});

    const startContractDeficit = await instance.methods
      .deficitTo(contractAddress)
      .call();
    assert.equal(
      startContractDeficit,
      target,
      "Invalid start contract deficit"
    );

    await web3.eth.sendTransaction({
      from: governor,
      to: contractAddress,
      value: min,
    });
    const secondContractDeficit = await instance.methods
      .deficitTo(contractAddress)
      .call();
    assert.equal(secondContractDeficit, bn(target).sub(bn(min)).toString(), "Invalid second contract deficit");

    await web3.eth.sendTransaction({
      from: governor,
      to: contractAddress,
      value: bn(min).add(bn("1")).toString(),
    });
    const thirdContractDeficit = await instance.methods
      .deficitTo(contractAddress)
      .call();
    assert.equal(
      thirdContractDeficit.toString(),
      "0",
      "Invalid third contract deficit"
    );

    const endContractBalance = await web3.eth.getBalance(contractAddress);
    await contract.methods
      .transferETH(instance._address, endContractBalance)
      .send({from: governor});
  });

  it("deficit: should return eth balance deficit to all expenditures addresses", async () => {
    const instance = await artifacts.require("Budget");
    const contractA = development.contracts.Treasury.address;
    const contractB = development.contracts.Timelock.address;

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

    const deficit = await instance.methods.deficit().call();
    assert.equal(
      deficit.toString(),
      bn(expenditures[contractA].target)
        .add(bn(expenditures[contractB].target))
        .toString(),
      "Invalid deficit"
    );
  });

  it("deficitTo: should revert tx if target is not expenditure item", async () => {
    const instance = await artifacts.require("Budget");
    const [, notExpenditureItem] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.deficitTo(notExpenditureItem).call(),
      "Budget::deficitTo: recipient not in expenditure item"
    );
  });
});
