const assertions = require("truffle-assertions");
const Buyback = artifacts.require("Buyback");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("Buyback.changeRecipient", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("changeRecipient: should change recipient address", async () => {
    const instance = await Buyback.deployed();
    const contract = Bond.address;

    const startRecipient = await instance.recipient();
    assert.equal(
        startRecipient != contract,
        true,
        "Invalid start recipient"
    );

    await instance.changeRecipient(contract, {from: governor});

    const endRecipient = await instance.recipient();
    assert.equal(
        endRecipient == contract,
        true,
        "Invalid end recipient"
    );
  });

  it("changeExpenditure: should revert tx if sender not owner", async () => {
    const instance = await Buyback.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.changeRecipient(governor, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
