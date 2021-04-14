const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");

contract("DepositaryUpdateValidator.validate", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("validate: should return true for new depositary", async () => {
    const [instance, depositary] = await artifacts.requireAll(
      "DepositaryUpdateValidator",
      "RealAssetDepositaryBalanceView"
    );

    const lastUpdateBlockNumber = await depositary.methods
      .lastUpdateBlockNumber()
      .call();
    assert.equal(lastUpdateBlockNumber, "0", "Invalid last update block");

    const isValid = await instance.methods.validate().call();
    assert.equal(isValid, true, "Invalid validation result");
  });

  it("validate: should return true if depositary updated recently", async () => {
    const [instance, depositary, gov] = await artifacts.requireAll(
      "DepositaryUpdateValidator",
      "RealAssetDepositaryBalanceView",
      "GovernanceToken"
    );

    await instance.methods.changeBlockLimit(5).send({from: governor});
    await depositary.methods.put("1", "0", "0", "0", "", "").send({from: governor, gas: 6000000});

    const isValidStart = await instance.methods.validate().call();
    assert.equal(isValidStart, true, "Invalid start validation result");

    await gov.methods.transfer(governor, '0').send({from: governor}); // next block
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block
    await gov.methods.transfer(governor, '0').send({from: governor}); // next block

    const isValidEnd = await instance.methods.validate().call();
    assert.equal(isValidEnd, false, "Invalid end validation result");
  });
});
