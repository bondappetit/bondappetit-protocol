const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Vesting.getParticipants", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const amount = "100";
  const date = "0";

  it("getParticipants: should return empty array if not locked participant", async () => {
    const instance = await artifacts.require("Vesting");

    const participants = await instance.methods.getParticipants().call();
    assert.equal(participants.length, 0, "Invalid participants list");
  });

  it("getParticipants: should return participants list", async () => {
    const [instance, bond] = await artifacts.requireAll("Vesting", "Bond");
    const [, recipientA, recipientB] = await web3.eth.getAccounts();

    await bond.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .lock(recipientA, amount, date)
      .send({from: governor, gas: 6000000});

    await bond.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .lock(recipientB, amount, date)
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
