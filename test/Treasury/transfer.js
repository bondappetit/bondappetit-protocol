const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Treasury.transfer", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("transfer: should transfer target token", async () => {
    const [instance, gov] = await artifacts.requireAll("Treasury", "GovernanceToken");
    const [, accountWithoutTokens] = artifacts.accounts;
    const amount = "10";

    await gov.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startTreasuryBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const startAccountBalance = await gov.methods
      .balanceOf(accountWithoutTokens)
      .call();
    assert.equal(
      startTreasuryBalance,
      amount,
      "Invalid start treasury balance"
    );
    assert.equal(startAccountBalance, "0", "Invalid start account balance");

    await instance.methods
      .transfer(gov._address, accountWithoutTokens, amount)
      .send({
        from: governor,
      });
    const endTreasuryBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const endAccountBalance = await gov.methods
      .balanceOf(accountWithoutTokens)
      .call();
    assert.equal(endTreasuryBalance, "0", "Invalid end treasury balance");
    assert.equal(endAccountBalance, amount, "Invalid end account balance");
  });

  it("transfer: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Treasury");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.transfer(governor, governor, 10).send({from: notOwner}),
      "AccessControl: caller is not allowed"
    );
  });
});
