const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("UniV2BuybackDepositaryBalanceView.caller", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeCaller: should change caller wallet", async () => {
    const instance = await artifacts.require(
      "UniV2BuybackDepositaryBalanceView"
    );
    const [, caller] = artifacts.accounts;

    const startCaller = await instance.methods.caller().call();
    assert.equal(startCaller != caller, true, "Invalid start caller");

    await instance.methods.changeCaller(caller).send({from: governor});

    const endCaller = await instance.methods.caller().call();
    assert.equal(endCaller == caller, true, "Invalid end caller");
  });

  it("changeCaller: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require(
      "UniV2BuybackDepositaryBalanceView"
    );
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeCaller(governor).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
