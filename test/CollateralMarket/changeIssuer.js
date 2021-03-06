const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("CollateralMarket.changeIssuer", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeIssuer: should change issuer contract address", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "CollateralMarket",
      "GovernanceToken"
    );

    const startAddress = await instance.methods.issuer().call();

    await instance.methods.changeIssuer(gov._address).send({from: governor});

    const endAddress = await instance.methods.issuer().call();
    assert.equal(
      startAddress !== endAddress,
      true,
      "Start address equals end address"
    );
    assert.equal(endAddress, gov._address, "Invalid end address");
  });

  it("changeIssuer: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("CollateralMarket");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeIssuer(notOwner).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
