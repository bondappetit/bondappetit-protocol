const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../../utils/test");
const {development} = require("../../../networks");

const pausedAbi = [
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

contract("ProtocolValidator.validate", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("validate: should pause all protocol contracts if state invalid", async () => {
    const [instance, validator, stable] = await artifacts.requireAll(
      "ProtocolValidator",
      "CollateralBalanceValidator",
      "StableToken"
    );

    const protocolContracts = await instance.methods
      .protocolContractsList()
      .call();
    const startProtocolContractsState = await Promise.all(
      protocolContracts.map(async (address) => {
        const contract = new web3.eth.Contract(pausedAbi, address);
        return [address, await contract.methods.paused().call()];
      })
    );
    const isAllUnpaused = !startProtocolContractsState.reduce(
      (res, [, isPaused]) => res || isPaused,
      false
    );
    assert.equal(isAllUnpaused, true, "Invalid start protocol contracts state");

    await stable.methods.mint(governor, "100").send({from: governor});
    await instance.methods
      .validate(validator._address)
      .send({from: governor, gas: 6000000});

    const endProtocolContractsState = await Promise.all(
      protocolContracts.map(async (address) => {
        const contract = new web3.eth.Contract(pausedAbi, address);
        return [address, await contract.methods.paused().call()];
      })
    );
    const isAllPaused = endProtocolContractsState.reduce(
      (res, [, isPaused]) => res && isPaused,
      true
    );
    assert.equal(isAllPaused, true, "Invalid end protocol contracts state");
  });

  it("validate: should pause all unpaused contracts", async () => {
    const [instance, validator, issuer] = await artifacts.requireAll(
      "ProtocolValidator",
      "CollateralBalanceValidator",
      "Issuer"
    );

    await issuer.methods.unpause().send({from: governor});
    const protocolContracts = await instance.methods
      .protocolContractsList()
      .call();
    const startProtocolContractsState = await Promise.all(
      protocolContracts.map(async (address) => {
        const contract = new web3.eth.Contract(pausedAbi, address);
        return [address, await contract.methods.paused().call()];
      })
    );
    const isAllUnpaused = !startProtocolContractsState.reduce(
      (res, [, isPaused]) => res || isPaused,
      false
    );
    assert.equal(
      isAllUnpaused,
      false,
      "Invalid start protocol contracts state"
    );

    await instance.methods
      .validate(validator._address)
      .send({from: governor, gas: 6000000});

    const endProtocolContractsState = await Promise.all(
      protocolContracts.map(async (address) => {
        const contract = new web3.eth.Contract(pausedAbi, address);
        return [address, await contract.methods.paused().call()];
      })
    );
    const isAllPaused = endProtocolContractsState.reduce(
      (res, [, isPaused]) => res && isPaused,
      true
    );
    assert.equal(isAllPaused, true, "Invalid end protocol contracts state");
  });

  it("validate: should pause concrete contract", async () => {
    const [instance, validator, issuer, market] = await artifacts.requireAll(
      "ProtocolValidator",
      "CollateralBalanceValidator",
      "Issuer",
      "Market"
    );

    await issuer.methods.unpause().send({from: governor});
    await market.methods.unpause().send({from: governor});
    await instance.methods
      .addValidator(validator._address, issuer._address)
      .send({from: governor});
    await instance.methods
      .validate(validator._address)
      .send({from: governor, gas: 6000000});

    const isIssuerPaused = await issuer.methods.paused().call();
    const isMarketPaused = await market.methods.paused().call();
    assert.equal(isIssuerPaused, true, "Invalid issuer paused state");
    assert.equal(isMarketPaused, false, "Invalid market paused state");
  });

  it("validate: should revert tx if validator not found", async () => {
    const instance = await artifacts.require("ProtocolValidator");
    const [, notValidator] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.validate(notValidator).send({
        from: governor,
        gas: 6000000,
      }),
      "ProtocolValidator::validate: validator not found"
    );
  });

  it("validate: should revert tx if controlled contract not control", async () => {
    const [instance, validator, issuer] = await artifacts.requireAll(
      "ProtocolValidator",
      "CollateralBalanceValidator",
      "Issuer"
    );

    await issuer.methods.changePauser(governor).send({from: governor});
    await instance.methods
      .addValidator(validator._address, issuer._address)
      .send({from: governor});

    await assertions.reverts(
      instance.methods.validate(validator._address).send({
        from: governor,
        gas: 6000000,
      }),
      "ProtocolValidator::_pause: target contract not control"
    );
  });
});
