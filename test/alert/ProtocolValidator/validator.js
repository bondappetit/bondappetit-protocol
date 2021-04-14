const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../../utils/test");

contract("ProtocolValidator.validators", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const contract = network.contracts.Governance.address;

  it("addValidator: should add validator", async () => {
    const instance = await artifacts.require("ProtocolValidator");

    const startValidators = await instance.methods.validatorsList().call();
    const startSize = await instance.methods.size().call();
    assert.equal(
      startValidators.includes(contract),
      false,
      "Invalid start validators list"
    );

    await instance.methods
      .addValidator(contract, contract)
      .send({from: governor});

    const endValidators = await instance.methods.validatorsList().call();
    const endSize = await instance.methods.size().call();
    assert.equal(
      endValidators.includes(contract),
      true,
      "Invalid end validators list"
    );
    assert.equal(
      endSize,
      bn(startSize).add(bn(1)).toString(),
      "Invalid end size"
    );
  });

  it("addValidator: should revert tx if invalid validator", async () => {
    const instance = await artifacts.require("ProtocolValidator");
    const invalid = "0x0000000000000000000000000000000000000000";

    await assertions.reverts(
      instance.methods.addValidator(invalid, contract).send({
        from: governor,
      }),
      "ProtocolValidator::addValidator: invalid validator address"
    );
  });

  it("addValidator: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("ProtocolValidator");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.addValidator(contract, contract).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("removeValidator: should remove validator", async () => {
    const instance = await artifacts.require("ProtocolValidator");

    const startValidators = await instance.methods.validatorsList().call();
    const startSize = await instance.methods.size().call();
    assert.equal(
      startValidators.includes(contract),
      true,
      "Invalid start validators list"
    );

    await instance.methods.removeValidator(contract).send({from: governor});

    const endValidators = await instance.methods.validatorsList().call();
    const endSize = await instance.methods.size().call();
    assert.equal(
      endValidators.includes(contract),
      false,
      "Invalid end validators list"
    );
    assert.equal(
      endSize,
      bn(startSize).sub(bn(1)).toString(),
      "Invalid end size"
    );
  });

  it("removeValidator: should revert tx if invalid validator", async () => {
    const instance = await artifacts.require("ProtocolValidator");
    const invalid = "0x0000000000000000000000000000000000000000";

    await assertions.reverts(
      instance.methods.removeValidator(invalid).send({
        from: governor,
      }),
      "ProtocolValidator::removeValidator: invalid validator address"
    );
  });

  it("removeValidator: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("ProtocolValidator");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.removeValidator(contract).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
