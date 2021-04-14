const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../../utils/test");

contract("ProtocolValidator.protocolContracts", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const contract = network.contracts.Governance.address;

  it("addProtocolContract: should add protocol contract", async () => {
    const instance = await artifacts.require("ProtocolValidator");

    const startContracts = await instance.methods
      .protocolContractsList()
      .call();
    const startSize = await instance.methods.size().call();
    assert.equal(
      startContracts.includes(contract),
      false,
      "Invalid start protocol contracts list"
    );

    await instance.methods.addProtocolContract(contract).send({from: governor});

    const endContracts = await instance.methods.protocolContractsList().call();
    const endSize = await instance.methods.size().call();
    assert.equal(
      endContracts.includes(contract),
      true,
      "Invalid end protocol contracts list"
    );
    assert.equal(
      endSize,
      bn(startSize).add(bn(1)).toString(),
      "Invalid end size"
    );
  });

  it("addProtocolContract: should revert tx if invalid contract", async () => {
    const instance = await artifacts.require("ProtocolValidator");
    const invalid = "0x0000000000000000000000000000000000000000";

    await assertions.reverts(
      instance.methods.addProtocolContract(invalid).send({
        from: governor,
      }),
      "ProtocolValidator::addProtocolContract: invalid contract address"
    );
  });

  it("addProtocolContract: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("ProtocolValidator");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.addProtocolContract(contract).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("removeProtocolContract: should remove protocol contract", async () => {
    const instance = await artifacts.require("ProtocolValidator");

    const startContracts = await instance.methods
      .protocolContractsList()
      .call();
    const startSize = await instance.methods.size().call();
    assert.equal(
      startContracts.includes(contract),
      true,
      "Invalid start protocol contracts list"
    );

    await instance.methods
      .removeProtocolContract(contract)
      .send({from: governor});

    const endContracts = await instance.methods.protocolContractsList().call();
    const endSize = await instance.methods.size().call();
    assert.equal(
      endContracts.includes(contract),
      false,
      "Invalid end protocol contracts list"
    );
    assert.equal(
      endSize,
      bn(startSize).sub(bn(1)).toString(),
      "Invalid end size"
    );
  });

  it("removeProtocolContract: should revert tx if invalid contract", async () => {
    const instance = await artifacts.require("ProtocolValidator");
    const invalid = "0x0000000000000000000000000000000000000000";

    await assertions.reverts(
      instance.methods.removeProtocolContract(invalid).send({
        from: governor,
      }),
      "ProtocolValidator::removeProtocolContract: invalid contract address"
    );
  });

  it("removeProtocolContract: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("ProtocolValidator");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.removeProtocolContract(contract).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
