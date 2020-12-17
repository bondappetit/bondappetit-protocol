const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Budget = artifacts.require("Budget");
const Treasury = artifacts.require("Treasury");
const Timelock = artifacts.require("Timelock");
const {development} = require("../../networks");

contract("Budget.deficit", (accounts) => {
  const governor = development.accounts.Governor.address;
  const expenditures = {
    [Treasury.address]: {
        min: "5",
        target: "10",
    },
    [Timelock.address]: {
        min: "2",
        target: "4",
    },
  };

  it("deficitTo: should return eth balance deficit to target address", async () => {
    const instance = await Budget.deployed();
    const contract = Treasury.address;
    const contractInstance = await Treasury.deployed();
    const {min, target} = expenditures[contract];

    const contractBalance = await web3.eth.getBalance(contract);
    if (contractBalance > 0) {
        await contractInstance.transferETH(Budget.address, contractBalance);
    }

    await instance.changeExpenditure(contract, min, target, {from: governor});

    const startContractDeficit = await instance.deficitTo(contract);
    assert.equal(
      startContractDeficit.toString(),
      target,
      "Invalid start contract deficit"
    );

    await web3.eth.sendTransaction({
        from: governor,
        to: contract,
        value: min
    });
    const secondContractDeficit = await instance.deficitTo(contract);
    assert.equal(
      secondContractDeficit.toString(),
      '5',
      "Invalid second contract deficit"
    );

    await web3.eth.sendTransaction({
        from: governor,
        to: contract,
        value: utils.toBN(min).add(utils.toBN('1')).toString()
    });
    const thirdContractDeficit = await instance.deficitTo(contract);
    assert.equal(
      thirdContractDeficit.toString(),
      '0',
      "Invalid third contract deficit"
    );

    const endContractBalance = await web3.eth.getBalance(contract);
    await contractInstance.transferETH(Budget.address, endContractBalance);
  });

  it("deficit: should return eth balance deficit to all expenditures addresses", async () => {
    const instance = await Budget.deployed();
    const contractA = Treasury.address;
    const contractB = Timelock.address;

    await instance.changeExpenditure(contractA, expenditures[contractA].min, expenditures[contractA].target, {from: governor});
    await instance.changeExpenditure(contractB, expenditures[contractB].min, expenditures[contractB].target, {from: governor});

    const deficit = await instance.deficit();
    assert.equal(
      deficit.toString(),
      utils.toBN(expenditures[contractA].target).add(utils.toBN(expenditures[contractB].target)).toString(),
      "Invalid deficit"
    );
  });

  it("deficitTo: should revert tx if target is not expenditure item", async () => {
    const instance = await Budget.deployed();
    const notExpenditureItem = accounts[1];

    await assertions.reverts(
      instance.deficitTo(notExpenditureItem),
      "Budget::deficitTo: recipient not in expenditure item"
    );
  });
});
