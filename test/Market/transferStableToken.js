const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.transferStableToken", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("transferStableToken: should transfer stable token", async () => {
    const [instance, stable] = await artifacts.requireAll("Market", "StableToken");
    const [, recipient] = artifacts.accounts;
    const amount = "1000000";

    assert.equal(
      await stable.methods.balanceOf(recipient).call(),
      "0",
      "Invalid start balance"
    );

    await stable.methods.mint(instance._address, amount).send({from: governor});
    await instance.methods
      .transferStableToken(recipient, amount)
      .send({from: governor});
    assert.equal(
      await stable.methods.balanceOf(recipient).call(),
      amount,
      "Invalid end balance"
    );
  });

  it("approve: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Market");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.transferStableToken(notOwner, "1000000").send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
