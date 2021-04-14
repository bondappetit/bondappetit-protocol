const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");

contract("CollateralBalanceValidator.changeCollateral", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const collateral = network.contracts.Governance.address;

  it("changeCollateral: should change collateral address", async () => {
    const instance = await artifacts.require("CollateralBalanceValidator");

    await instance.methods.changeCollateral(collateral).send({from: governor});

    const endCollateral = await instance.methods.collateral().call();
    assert.equal(endCollateral, collateral, "Invalid end collateral");
  });

  it("changeCollateral: should revert tx if invalid token", async () => {
    const instance = await artifacts.require("CollateralBalanceValidator");
    const invalid = "0x0000000000000000000000000000000000000000";

    await assertions.reverts(
      instance.methods.changeCollateral(invalid).send({
        from: governor,
      }),
      "CollateralBalanceValidator::changeCollateral: invalid collateral address"
    );
  });

  it("changeCollateral: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("CollateralBalanceValidator");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeCollateral(collateral).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
