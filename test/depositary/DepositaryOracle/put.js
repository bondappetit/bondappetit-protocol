const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("DepositaryOracle.put", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("put: should add security to depositary", async () => {
    const instance = await artifacts.require("DepositaryOracle");
    const amount = "10";

    const startSecurity = await instance.methods.get("test bond").call();
    assert.equal(startSecurity.amount, "0", "Start security amount invalid");

    await instance.methods.put("test bond", amount).send({
      from: governor,
    });
    const endSecurity = await instance.methods.get("test bond").call();
    assert.equal(endSecurity.amount, amount, "End security amount invalid");
  });

  it("put: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("DepositaryOracle");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.put("test bond", 10).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
