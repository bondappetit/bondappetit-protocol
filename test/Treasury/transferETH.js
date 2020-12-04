const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Treasury = artifacts.require("Treasury");
const {development} = require("../../networks");

contract("Treasury.transferETH", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("transferETH: should transfer ETH", async () => {
    const instance = await Treasury.deployed();
    const recipient = accounts[1];
    const amount = 10;

    await web3.eth.sendTransaction({
      from: governor,
      to: Treasury.address,
      value: amount,
      gas: 2000000
    });

    const startTreasuryBalance = await web3.eth.getBalance(Treasury.address);
    const startAccountBalance = await web3.eth.getBalance(recipient);
    assert.equal(
      startTreasuryBalance.toString(),
      amount.toString(),
      "Invalid start treasury balance"
    );

    await instance.transferETH(recipient, amount, {
      from: governor,
    });
    const endTreasuryBalance = await web3.eth.getBalance(Treasury.address);
    const endAccountBalance = await web3.eth.getBalance(recipient);
    assert.equal(
      endTreasuryBalance.toString(),
      "0",
      "Invalid end treasury balance"
    );
    assert.equal(
      endAccountBalance.toString(),
      utils.toBN(startAccountBalance).add(utils.toBN(amount)).toString(),
      "Invalid end account balance"
    );
  });

  it("transferETH: should revert tx if called is not the owner", async () => {
    const instance = await Treasury.deployed();

    await assertions.reverts(
      instance.transferETH(governor, 10, {from: accounts[1]}),
      "Ownable: caller is not the owner."
    );
  });
});
