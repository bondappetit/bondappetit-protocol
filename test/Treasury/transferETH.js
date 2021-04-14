const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");

contract("Treasury.transferETH", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("transferETH: should transfer ETH", async () => {
    const instance = await artifacts.require("Treasury");
    const [, recipient] = artifacts.accounts;
    const amount = "10";

    await web3.eth.sendTransaction({
      from: governor,
      to: instance._address,
      value: amount,
      gas: 2000000,
    });

    const startTreasuryBalance = await web3.eth.getBalance(instance._address);
    const startAccountBalance = await web3.eth.getBalance(recipient);
    assert.equal(
      startTreasuryBalance,
      amount,
      "Invalid start treasury balance"
    );

    await instance.methods.transferETH(recipient, amount).send({
      from: governor,
    });
    const endTreasuryBalance = await web3.eth.getBalance(instance._address);
    const endAccountBalance = await web3.eth.getBalance(recipient);
    assert.equal(endTreasuryBalance, "0", "Invalid end treasury balance");
    assert.equal(
      endAccountBalance,
      bn(startAccountBalance).add(bn(amount)).toString(),
      "Invalid end account balance"
    );
  });

  it("transferETH: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Treasury");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.transferETH(governor, 10).send({from: notOwner}),
      "AccessControl: caller is not allowed"
    );
  });
});
