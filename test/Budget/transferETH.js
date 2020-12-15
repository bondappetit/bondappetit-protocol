const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Budget = artifacts.require("Budget");
const Treasury = artifacts.require("Treasury");
const {development} = require("../../networks");

contract("Budget.transferETH", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("transferETH: should transfer eth to recipient", async () => {
    const instance = await Budget.deployed();
    const contract = Treasury.address;
    const amount = "10";

    const startBudgetBalance = await web3.eth.getBalance(Budget.address);
    const startContractBalance = await web3.eth.getBalance(contract);

    await web3.eth.sendTransaction({
      from: governor,
      to: Budget.address,
      value: amount,
    });

    const secondBudgetBalance = await web3.eth.getBalance(Budget.address);
    assert.equal(
      secondBudgetBalance.toString(),
      utils.toBN(startBudgetBalance).add(utils.toBN(amount)).toString(),
      "Invalid second budget balance"
    );

    await instance.transferETH(contract, amount, {from: governor});
    const endBudgetBalance = await web3.eth.getBalance(Budget.address);
    const endContractBalance = await web3.eth.getBalance(contract);
    assert.equal(
      endBudgetBalance.toString(),
      utils.toBN(secondBudgetBalance).sub(utils.toBN(amount)).toString(),
      "Invalid end budget balance"
    );
    assert.equal(
      endContractBalance.toString(),
      utils.toBN(startContractBalance).add(utils.toBN(amount)).toString(),
      "Invalid end contract balance"
    );
  });

  it("transferETH: should revert tx if sender not owner", async () => {
    const instance = await Budget.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.transferETH(Treasury.address, "10", {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
