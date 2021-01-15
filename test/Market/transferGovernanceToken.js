const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.transferGovernanceToken", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("transferGovernanceToken: should transfer governance token", async () => {
    const [instance, gov] = await artifacts.requireAll("Market", "GovernanceToken");
    const [, recipient] = artifacts.accounts;
    const amount = "1000000";

    assert.equal(
      await gov.methods.balanceOf(recipient).call(),
      "0",
      "Invalid start balance"
    );

    await gov.methods.mint(instance._address, amount).send({from: governor});
    await instance.methods
      .transferGovernanceToken(recipient, amount)
      .send({from: governor});
    assert.equal(
      await gov.methods.balanceOf(recipient).call(),
      amount,
      "Invalid end balance"
    );
  });

  it("approve: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Market");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.transferGovernanceToken(notOwner, "1000000").send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
