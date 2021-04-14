const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");

contract("CollateralBalanceValidator.validate", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("validate: should return true for balance protocol and false for imbalance protocol", async () => {
    const [instance, depositary, stable] = await artifacts.requireAll(
      "CollateralBalanceValidator",
      "RealAssetDepositaryBalanceView",
      "StableToken"
    );
    const permissibleImbalance = "10";
    const stableBalance = "100000000000000000000";
    const firstCollateralBalance = "100000000";
    const secondCollateralBalance = "90000000";
    const imbalanceCollateralBalance = "80000000";

    await instance.methods
      .changePermissibleImbalance(permissibleImbalance)
      .send({from: governor});
    await stable.methods.mint(governor, stableBalance).send({from: governor});
    await depositary.methods
      .put("1", firstCollateralBalance, "1", "0", "", "")
      .send({from: governor, gas: 6000000});

    const isFirstValid = await instance.methods.validate().call();
    assert.equal(isFirstValid, true, "Invalid first validation result");

    await depositary.methods
      .put("1", secondCollateralBalance, "1", "0", "", "")
      .send({from: governor, gas: 6000000});

    const isSecondValid = await instance.methods.validate().call();
    assert.equal(isSecondValid, true, "Invalid second validation result");

    await depositary.methods
      .put("1", imbalanceCollateralBalance, "1", "0", "", "")
      .send({from: governor, gas: 6000000});

    const isImbalanceValid = await instance.methods.validate().call();
    assert.equal(
      isImbalanceValid,
      false,
      "Invalid imbalance validation result"
    );
  });
});
