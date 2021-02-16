const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Issuer.changeStableTokenOwner", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeStableTokenOwner: should change owner of stable token contract", async () => {
    const [instance, stable] = await artifacts.requireAll(
      "Issuer",
      "StableToken"
    );
    const [, , recipient] = artifacts.accounts;

    const oldOwner = await stable.methods.owner().call();

    await instance.methods
      .changeStableTokenOwner(recipient)
      .send({from: governor, gas: 6000000});

    const newOwner = await stable.methods.owner().call();
    assert.equal(oldOwner !== newOwner, true, "Owner not changed");
    assert.equal(newOwner === recipient, true, "New owner invalid");
  });

  it("changeStableTokenOwner: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Issuer");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeStableTokenOwner(governor).send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
