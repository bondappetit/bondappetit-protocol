const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");

contract("Buyback.changeRecipient", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("changeRecipient: should change recipient address", async () => {
    const instance = await artifacts.require("Buyback");
    const contract = network.contracts.Governance.address;

    const startRecipient = await instance.methods.recipient().call();
    assert.equal(startRecipient != contract, true, "Invalid start recipient");

    await instance.methods.changeRecipient(contract).send({from: governor});

    const endRecipient = await instance.methods.recipient().call();
    assert.equal(endRecipient == contract, true, "Invalid end recipient");
  });

  it("changeExpenditure: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("Buyback");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeRecipient(governor).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
