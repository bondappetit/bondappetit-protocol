const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Treasury.transfer", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("transfer: should transfer target token", async () => {
    const [instance, bond] = await artifacts.requireAll("Treasury", "Bond");
    const accountWithoutTokens = (await web3.eth.getAccounts())[1];
    const amount = "10";

    await bond.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startTreasuryBalance = await bond.methods
      .balanceOf(instance._address)
      .call();
    const startAccountBalance = await bond.methods
      .balanceOf(accountWithoutTokens)
      .call();
    assert.equal(
      startTreasuryBalance,
      amount,
      "Invalid start treasury balance"
    );
    assert.equal(startAccountBalance, "0", "Invalid start account balance");

    await instance.methods
      .transfer(bond._address, accountWithoutTokens, amount)
      .send({
        from: governor,
      });
    const endTreasuryBalance = await bond.methods
      .balanceOf(instance._address)
      .call();
    const endAccountBalance = await bond.methods
      .balanceOf(accountWithoutTokens)
      .call();
    assert.equal(endTreasuryBalance, "0", "Invalid end treasury balance");
    assert.equal(endAccountBalance, amount, "Invalid end account balance");
  });

  it("transfer: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Treasury");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.transfer(governor, governor, 10).send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
