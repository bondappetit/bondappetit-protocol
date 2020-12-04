const Bond = artifacts.require("Bond");
const Vesting = artifacts.require("Vesting");
const {development} = require("../../networks");

contract("Vesting.getParticipants", (accounts) => {
  const governor = development.accounts.Governor.address;
  const recipientA = accounts[1];
  const recipientB = accounts[2];
  const amount = "100";
  const date = "0";

  it("getParticipants: should return empty array if not locked participant", async () => {
    const instance = await Vesting.deployed();


    const participants = await instance.getParticipants();
    assert.equal(
      participants.length,
      0,
      "Invalid participants list"
    );
  });

  it("getParticipants: should return participants list", async () => {
    const instance = await Vesting.deployed();
    const bond = await Bond.deployed();

    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipientA, amount, date, {from: governor});

    await bond.approve(Vesting.address, amount, {from: governor});
    await instance.lock(recipientB, amount, date, {from: governor});

    const participants = await instance.getParticipants();
    assert.equal(
      participants.length,
      2,
      "Invalid participants list length"
    );
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
