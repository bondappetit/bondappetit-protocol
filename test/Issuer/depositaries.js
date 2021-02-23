const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Issuer.depositaries", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("addDepositary: should add new depositary", async () => {
    const instance = await artifacts.require("Issuer");
    const [, depositary] = artifacts.accounts;

    assert.equal(
      await instance.methods.hasDepositary(depositary).call(),
      false,
      "Invalid start state"
    );
    const startSize = await instance.methods.size().call();
    await instance.methods.addDepositary(depositary).send({
      from: governor,
      gas: 6000000,
    });

    const endSize = await instance.methods.size().call();
    const endDepositaries = await instance.methods.allowedDepositaries().call();
    assert.equal(
      endSize,
      bn(startSize).add(bn(1)).toString(),
      "End size invalid"
    );
    assert.equal(
      await instance.methods.hasDepositary(depositary).call(),
      true,
      "Depositary not added"
    );
    assert.equal(
      endDepositaries.includes(depositary),
      true,
      "Depositary not added to list"
    );
  });

  it("removeDepositary: should remove depositary", async () => {
    const instance = await artifacts.require("Issuer");
    const [, depositary] = artifacts.accounts;

    const startSize = await instance.methods.size().call();
    await instance.methods.removeDepositary(depositary).send({
      from: governor,
      gas: 6000000,
    });

    const endSize = await instance.methods.size().call();
    const endDepositaries = await instance.methods.allowedDepositaries().call();
    assert.equal(
      endSize,
      bn(startSize).sub(bn(1)).toString(),
      "End size invalid"
    );
    assert.equal(
      endDepositaries.includes(depositary),
      false,
      "Depositary not removed"
    );
  });
});
