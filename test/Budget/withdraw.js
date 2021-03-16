const {utils} = require("web3");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Budget.deficit", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("withdraw: should withdraw balance", async () => {
    const instance = await artifacts.require("Budget");
    const [, recipientA, recipientB] = artifacts.accounts;
    const expenditures = {
      [recipientA]: {
        min: "100000000000000000000",
        target: "100000000000000000000",
      },
      [recipientB]: {
        min: "100000000000000000000",
        target: "100000000000000000000",
      },
    };
    await web3.eth.sendTransaction({
      from: recipientA,
      to: governor,
      value: "1000000000000000000",
      gasPrice: 0,
    });
    await web3.eth.sendTransaction({
      from: recipientB,
      to: governor,
      value: "1000000000000000000",
      gasPrice: 0,
    });

    await instance.methods
      .changeExpenditure(
        recipientA,
        expenditures[recipientA].min,
        expenditures[recipientA].target
      )
      .send({from: governor});
    await instance.methods
      .changeExpenditure(
        recipientB,
        expenditures[recipientB].min,
        expenditures[recipientB].target
      )
      .send({from: governor});
    const deficitA = await instance.methods.deficitTo(recipientA).call();
    const deficitB = await instance.methods.deficitTo(recipientB).call();
    const amount = bn(deficitA).add(bn(deficitB)).toString();
    await web3.eth.sendTransaction({
      from: governor,
      to: instance._address,
      value: amount,
    });
    await instance.methods.pay().send({from: governor, gas: 6000000});

    const startEthBalanceA = await web3.eth.getBalance(recipientA);
    const startBalanceRecipientA = await instance.methods
      .balanceOf(recipientA)
      .call();
    const startTotalSupply = await instance.methods.totalSupply().call();
    assert.equal(
      startBalanceRecipientA,
      deficitA,
      "Invalid start balance to recipient A"
    );
    assert.equal(startTotalSupply, amount, "Invalid start total supply");

    const withdrawTx = await instance.methods
      .withdraw()
      .send({from: recipientA, gas: 6000000, gasPrice: 1});

    const endEthBalanceA = await web3.eth.getBalance(recipientA);
    const endBalanceRecipientA = await instance.methods
      .balanceOf(recipientA)
      .call();
    const endTotalSupply = await instance.methods.totalSupply().call();
    assert.equal(
      endEthBalanceA,
      bn(startEthBalanceA).add(bn(deficitA)).sub(bn(withdrawTx.gasUsed)).toString(),
      "Invalid end ETH balance to recipient A"
    );
    assert.equal(
      endBalanceRecipientA,
      "0",
      "Invalid end balance to recipient A"
    );
    assert.equal(
      endTotalSupply,
      bn(amount).sub(bn(deficitA)).toString(),
      "Invalid end total supply"
    );
  });
});
