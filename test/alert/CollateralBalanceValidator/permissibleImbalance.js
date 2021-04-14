const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");

contract(
  "CollateralBalanceValidator.changePermissibleImbalance",
  ({web3, artifacts}) => {
    const network = artifacts.network;
    const governor = network.accounts.Governor.address;
    const permissibleImbalance = "50";

    it("changePermissibleImbalance: should change permissible imbalance limit", async () => {
      const instance = await artifacts.require("CollateralBalanceValidator");

      await instance.methods
        .changePermissibleImbalance(permissibleImbalance)
        .send({from: governor});

      const endPermissibleImbalance = await instance.methods
        .permissibleImbalance()
        .call();
      assert.equal(
        endPermissibleImbalance,
        permissibleImbalance,
        "Invalid end permissible imbalance"
      );
    });

    it("changePermissibleImbalance: should revert tx if sender not owner", async () => {
      const instance = await artifacts.require("CollateralBalanceValidator");
      const [, notOwner] = artifacts.accounts;

      await assertions.reverts(
        instance.methods.changePermissibleImbalance(permissibleImbalance).send({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });
  }
);
