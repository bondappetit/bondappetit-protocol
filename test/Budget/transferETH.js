const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");

contract("Budget.transferETH", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("transferETH: should transfer eth to recipient", async () => {
    const instance = await artifacts.require("Budget");
    const contract = network.contracts.Treasury.address;
    const amount = "10";

    const startBudgetBalance = await web3.eth.getBalance(instance._address);
    const startContractBalance = await web3.eth.getBalance(contract);

    await web3.eth.sendTransaction({
      from: governor,
      to: instance._address,
      value: amount,
    });

    const secondBudgetBalance = await web3.eth.getBalance(instance._address);
    assert.equal(
      secondBudgetBalance,
      bn(startBudgetBalance).add(bn(amount)).toString(),
      "Invalid second budget balance"
    );

    await instance.methods.transferETH(contract, amount).send({from: governor});
    const endBudgetBalance = await web3.eth.getBalance(instance._address);
    const endContractBalance = await web3.eth.getBalance(contract);
    assert.equal(
      endBudgetBalance,
      bn(secondBudgetBalance).sub(bn(amount)).toString(),
      "Invalid end budget balance"
    );
    assert.equal(
      endContractBalance,
      bn(startContractBalance).add(bn(amount)).toString(),
      "Invalid end contract balance"
    );
  });

  it("transferETH: should revert tx if transfer amount exceeds balance", async () => {
    const instance = await artifacts.require("Budget");
    const contract = await artifacts.require("Treasury");
    const contractAddress = network.contracts.Treasury.address;
    const amount = "10";

    const contractBalance = await web3.eth.getBalance(contractAddress);
    if (contractBalance > 0) {
      await contract.methods
        .transferETH(governor, contractBalance)
        .send({from: governor});
    }

    await instance.methods
      .changeExpenditure(contractAddress, amount, amount)
      .send({from: governor});
    await web3.eth.sendTransaction({
      from: governor,
      to: instance._address,
      value: amount,
    });
    await instance.methods.pay().send({from: governor, gas: 6000000});

    await assertions.reverts(
      instance.methods.transferETH(governor, amount).send({
        from: governor,
      }),
      "Budget::transferETH: transfer amount exceeds balance"
    );
  });

  it("transferETH: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("Budget");
    const [, notOwner] = artifacts.accounts;
    const contract = network.contracts.Treasury.address;

    await assertions.reverts(
      instance.methods.transferETH(contract, "10").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
