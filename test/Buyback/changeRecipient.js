const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Buyback.changeRecipient", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeRecipient: should change recipient address", async () => {
    const instance = await artifacts.require("Buyback");
    const contract = development.contracts.Bond.address;

    const startRecipient = await instance.methods.recipient().call();
    assert.equal(startRecipient != contract, true, "Invalid start recipient");

    await instance.methods.changeRecipient(contract).send({from: governor});

    const endRecipient = await instance.methods.recipient().call();
    assert.equal(endRecipient == contract, true, "Invalid end recipient");
  });

  it("changeExpenditure: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("Buyback");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.changeRecipient(governor).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
