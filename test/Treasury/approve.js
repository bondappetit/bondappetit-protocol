const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Treasury.approve", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("approve: should approve target token", async () => {
    const [instance, gov] = await artifacts.requireAll("Treasury", "GovernanceToken");
    const [, accountWithoutTokens] = artifacts.accounts;
    const amount = "10";

    await gov.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startAccountAllowance = await gov.methods
      .allowance(instance._address, accountWithoutTokens)
      .call();
    assert.equal(startAccountAllowance, "0", "Invalid start account allowance");

    await instance.methods
      .approve(gov._address, accountWithoutTokens, amount)
      .send({
        from: governor,
      });
    const endAccountAllowance = await gov.methods
      .allowance(instance._address, accountWithoutTokens)
      .call();
    assert.equal(endAccountAllowance, amount, "Invalid end account allowance");
  });

  it("approve: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Treasury");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.approve(governor, governor, 10).send({from: notOwner}),
      "AccessControl: caller is not allowed"
    );
  });
});
