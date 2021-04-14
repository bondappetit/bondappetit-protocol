const {contract, assert, bn} = require("../../utils/test");

contract("Vesting.getParticipants", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const amount = "100";
  const description = "test";
  const date = "0";

  it("getParticipants: should return empty array if not locked participant", async () => {
    const instance = await artifacts.require("Vesting");

    const participants = await instance.methods.getParticipants().call();
    assert.equal(participants.length, 0, "Invalid participants list");
  });

  it("getParticipants: should return participants list", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, recipientA, recipientB] = artifacts.accounts;

    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .lock(recipientA, amount, description, date)
      .send({from: governor, gas: 6000000});

    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .lock(recipientB, amount, description, date)
      .send({from: governor, gas: 6000000});

    const participants = await instance.methods.getParticipants().call();
    assert.equal(participants.length, 2, "Invalid participants list length");
    assert.equal(
      participants.includes(recipientA),
      true,
      "First recipient not includes in participants list"
    );
    assert.equal(
      participants.includes(recipientB),
      true,
      "Second recipient not includes in participants list"
    );
  });
});
