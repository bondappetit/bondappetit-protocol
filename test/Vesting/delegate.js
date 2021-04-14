const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");

contract("Vesting.delegate", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const amount = "100";
  const description = 'test';
  const date = "0";

  it("delegate: should delegate all votes to", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, recipient] = artifacts.accounts;

    await gov.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods.lock(recipient, amount, description, date).send({from: governor, gas: 6000000});
    await instance.methods.delegate(gov._address, governor).send({from: governor, gas: 6000000});

    const currentVotes = await gov.methods.getCurrentVotes(governor).call();
    assert.equal(
      currentVotes,
      amount,
      "Invalid votes"
    );
  });

  it("delegate: should revert tx if called is not the owner", async () => {
    const [instance, gov] = await artifacts.requireAll("Vesting", "GovernanceToken");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.delegate(gov._address, governor).send({from: notOwner, gas: 6000000}),
      "Ownable: caller is not the owner"
    );
  });
});
