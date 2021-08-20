const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("UniV2BuybackDepositaryBalanceView.issuer", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeIssuer: should change issuer address", async () => {
    const instance = await artifacts.require(
      "UniV2BuybackDepositaryBalanceView"
    );
    const contract = development.contracts.Governance.address;

    const startIssuer = await instance.methods.issuer().call();
    assert.equal(startIssuer != contract, true, "Invalid start address");

    await instance.methods.changeIssuer(contract).send({from: governor});

    const endIssuer = await instance.methods.issuer().call();
    assert.equal(endIssuer == contract, true, "Invalid end address");
  });

  it("changeIssuer: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require(
      "UniV2BuybackDepositaryBalanceView"
    );
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeIssuer(governor).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
