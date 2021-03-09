const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("DepositaryUpdateValidator.changeBlockLimit", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeBlockLimit: should change block limit", async () => {
    const instance = await artifacts.require("DepositaryUpdateValidator");
    const blockLimit = '1';

    await instance.methods.changeBlockLimit(blockLimit).send({from: governor});

    const endBlockLimit = await instance.methods.blockLimit().call();
    assert.equal(endBlockLimit, blockLimit, "Invalid end block limit");
  });

  it("changeBlockLimit: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("DepositaryUpdateValidator");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeBlockLimit('0').send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
