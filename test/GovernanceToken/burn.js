const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("GovernanceToken.burn", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("burn: should burn tokens", async () => {
    const instance = await artifacts.require("GovernanceToken");
    const burnAmount = "100";

    const startSupply = await instance.methods.totalSupply().call();
    const startBalance = await instance.methods.balanceOf(governor).call();

    await instance.methods.burn(governor, burnAmount).send({
      from: governor,
    });
    const endSuppty = await instance.methods.totalSupply().call();
    const endBalance = await instance.methods.balanceOf(governor).call();

    assert.equal(
      endSuppty,
      bn(startSupply).sub(bn(burnAmount)).toString(),
      "Total supply update after burned failed"
    );
    assert.equal(
      endBalance,
      bn(startBalance).sub(bn(burnAmount)).toString(),
      "Balance update after burned failed"
    );
  });

  it("burn: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("GovernanceToken");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.burn(governor, "100").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
