const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract(
  "CollateralMarket.allowedTokens",
  ({web3, artifacts}) => {
    const governor = development.accounts.Governor.address;

    it("allowToken: should add target token to allowed list", async () => {
      const [instance, gov] = await artifacts.requireAll(
        "CollateralMarket",
        "GovernanceToken"
      );

      assert.equal(
        (await instance.methods.allowedTokens().call()).includes(gov._address),
        false,
        "Invalid start allowed list"
      );

      await instance.methods.allowToken(gov._address).send({from: governor});

      assert.equal(
        (await instance.methods.allowedTokens().call()).includes(gov._address),
        true,
        "Invalid end allowed list"
      );
    });

    it("allowToken: should revert tx if sender not owner", async () => {
      const instance = await artifacts.require(
        "CollateralMarket"
      );
      const [, notOwner] = artifacts.accounts;

      await assertions.reverts(
        instance.methods.allowToken(notOwner).send({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });

    it("denyToken: should remove target token from allowed list", async () => {
      const [instance, gov] = await artifacts.requireAll(
        "CollateralMarket",
        "GovernanceToken"
      );

      assert.equal(
        (await instance.methods.allowedTokens().call()).includes(gov._address),
        true,
        "Invalid start allowed list"
      );

      await instance.methods.denyToken(gov._address).send({from: governor});

      assert.equal(
        (await instance.methods.allowedTokens().call()).includes(gov._address),
        false,
        "Invalid end allowed list"
      );
    });

    it("denyToken: should revert tx if sender not owner", async () => {
      const instance = await artifacts.require(
        "CollateralMarket"
      );
      const [, notOwner] = artifacts.accounts;

      await assertions.reverts(
        instance.methods.denyToken(notOwner).send({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });
  }
);
