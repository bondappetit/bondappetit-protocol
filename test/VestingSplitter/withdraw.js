const {contract, assert, bn} = require("../../utils/test");

contract("VestingSplitter.withdraw", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("withdraw: should withdraw token", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "VestingSplitter",
      "GovernanceToken"
    );
    const [, accountA, accountB] = artifacts.accounts;
    const accounts = [accountA, accountB];
    const shares = ["85", "15"];
    const amount = "1000";

    await instance.methods
      .changeShares(accounts, shares)
      .send({from: governor, gas: 6000000});
    await gov.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .split(gov._address)
      .send({from: governor, gas: 6000000});
    await instance.methods
      .withdraw(gov._address)
      .send({from: accountA, gas: 6000000});

    const endBalanceOfContract = await instance.methods
      .balanceOf(gov._address, accountA)
      .call();
    const totalSupply = await instance.methods.totalSupply(gov._address).call();
    const endBalanceOfToken = await gov.methods.balanceOf(accountA).call();
    assert.equal(endBalanceOfContract, "0", "Invalid end balance of contract");
    assert.equal(
      totalSupply,
      bn(amount).div(bn(100)).mul(bn(shares[1])).toString(),
      "Invalid end total supply"
    );
    assert.equal(
      endBalanceOfToken,
      bn(amount).div(bn(100)).mul(bn(shares[0])).toString(),
      "Invalid end balance of token"
    );
  });
});
