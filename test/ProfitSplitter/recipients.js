const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("ProfitSplitter.recipients", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const recipient = development.contracts.Governance.address;

  it("addRecipient: should add recipient", async () => {
    const instance = await artifacts.require("ProfitSplitter");
    const share = "0";

    const startRecipients = await instance.methods.getRecipients().call();
    assert.equal(
      startRecipients.includes(recipient),
      false,
      "Invalid start recipients"
    );

    await instance.methods
      .addRecipient(recipient, share)
      .send({from: governor});

    const endRecipients = await instance.methods.getRecipients().call();
    const endShare = await instance.methods.shares(recipient).call();
    assert.equal(
      endRecipients.includes(recipient),
      true,
      "Invalid end recipients"
    );
    assert.equal(endShare, share, "Invalid end share");
  });

  it("addRecipient: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("ProfitSplitter");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.addRecipient(recipient, 0).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("removeRecipient: should remove recipient", async () => {
    const instance = await artifacts.require("ProfitSplitter");

    const startRecipients = await instance.methods.getRecipients().call();
    assert.equal(
      startRecipients.includes(recipient),
      true,
      "Invalid start recipients"
    );

    await instance.methods.removeRecipient(recipient).send({from: governor});

    const endRecipients = await instance.methods.getRecipients().call();
    assert.equal(
      endRecipients.includes(recipient),
      false,
      "Invalid end recipients"
    );
  });

  it("removeRecipient: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("ProfitSplitter");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.removeRecipient(recipient).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
