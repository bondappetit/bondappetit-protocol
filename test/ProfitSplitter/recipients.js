const assertions = require("truffle-assertions");
const ProfitSplitter = artifacts.require("ProfitSplitter");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("ProfitSplitter.recipients", (accounts) => {
  const governor = development.accounts.Governor.address;
  const recipient = Bond.address;

  it("addRecipient: should add recipient", async () => {
    const instance = await ProfitSplitter.deployed();
    const share = 0;

    const startRecipients = await instance.getRecipients();
    assert.equal(
      startRecipients.includes(recipient),
      false,
      "Invalid start recipients"
    );

    await instance.addRecipient(recipient, share, {from: governor});

    const endRecipients = await instance.getRecipients();
    const endShare = await instance.shares(recipient);
    assert.equal(
      endRecipients.includes(recipient),
      true,
      "Invalid end recipients"
    );
    assert.equal(endShare.toString(), share, "Invalid end share");
  });

  it("addRecipient: should revert tx if sender not owner", async () => {
    const instance = await ProfitSplitter.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.addRecipient(recipient, 0, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("removeRecipient: should remove recipient", async () => {
    const instance = await ProfitSplitter.deployed();

    const startRecipients = await instance.getRecipients();
    assert.equal(
      startRecipients.includes(recipient),
      true,
      "Invalid start recipients"
    );

    await instance.removeRecipient(recipient, {from: governor});

    const endRecipients = await instance.getRecipients();
    assert.equal(
      endRecipients.includes(recipient),
      false,
      "Invalid end recipients"
    );
  });

  it("removeRecipient: should revert tx if sender not owner", async () => {
    const instance = await ProfitSplitter.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.removeRecipient(recipient, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
