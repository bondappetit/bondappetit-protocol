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

  it("deficit: should return eth balance deficit to all expenditures addresses", async () => {
    const instance = await Budget.deployed();
    const contractA = Treasury.address;
    const contractB = Timelock.address;

    await web3.eth.sendTransaction({
        from: governor,
        to: Budget.address,
        value: utils.toBN(expenditures[contractA].target).add(utils.toBN(expenditures[contractB].target)).toString()
    });
    await instance.changeExpenditure(contractA, expenditures[contractA].min, expenditures[contractA].target, {from: governor});
    await instance.changeExpenditure(contractB, expenditures[contractB].min, expenditures[contractB].target, {from: governor});

    await instance.pay();

    const endBalanceContractA = await web3.eth.getBalance(contractA);
    const endBalanceContractB = await web3.eth.getBalance(contractB);
    assert.equal(
        endBalanceContractA.toString(),
        expenditures[contractA].target,
        "Invalid end balance to contract A"
    );
    assert.equal(
        endBalanceContractB.toString(),
        expenditures[contractB].target,
        "Invalid end balance to contract B"
    );
  });
});
