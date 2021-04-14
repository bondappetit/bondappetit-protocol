const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");

contract(
  "CollateralBalanceValidator.changeStableToken",
  ({web3, artifacts}) => {
    const network = artifacts.network;
    const governor = network.accounts.Governor.address;
    const token = network.contracts.Governance.address;

    it("changeStableToken: should change stable token address", async () => {
      const instance = await artifacts.require("CollateralBalanceValidator");

      await instance.methods.changeStableToken(token).send({from: governor});

      const endStableToken = await instance.methods.stableToken().call();
      assert.equal(endStableToken, token, "Invalid end token");
    });

    it("changeStableToken: should revert tx if invalid token", async () => {
      const instance = await artifacts.require("CollateralBalanceValidator");
      const invalid = "0x0000000000000000000000000000000000000000";

      await assertions.reverts(
        instance.methods.changeStableToken(invalid).send({
          from: governor,
        }),
        "CollateralBalanceValidator::changeStableToken: invalid stable token address"
      );
    });

    it("changeStableToken: should revert tx if sender not owner", async () => {
      const instance = await artifacts.require("CollateralBalanceValidator");
      const [, notOwner] = artifacts.accounts;

      await assertions.reverts(
        instance.methods.changeStableToken(token).send({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });
  }
);
