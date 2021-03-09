const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("DepositaryUpdateValidator.changeDepositary", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const depositary = development.contracts.Governance.address;

  it("changeDepositary: should change depositary address", async () => {
    const instance = await artifacts.require("DepositaryUpdateValidator");

    await instance.methods.changeDepositary(depositary).send({from: governor});

    const endDepositary = await instance.methods.depositary().call();
    assert.equal(endDepositary, depositary, "Invalid end depositary");
  });

  it("changeDepositary: should revert tx if invalid depositary", async () => {
    const instance = await artifacts.require("DepositaryUpdateValidator");
    const invalid = "0x0000000000000000000000000000000000000000";

    await assertions.reverts(
      instance.methods.changeDepositary(invalid).send({
        from: governor,
      }),
      "DepositaryUpdateValidator::changeDepositary: invalid depositary address"
    );
  });

  it("changeDepositary: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("DepositaryUpdateValidator");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeDepositary(depositary).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
