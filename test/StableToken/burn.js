const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");

contract("StableToken.burn", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("burn: should burn tokens", async () => {
    const instance = await artifacts.require("StableToken");
    const burnAmount = "100";

    await instance.methods.mint(governor, "100".toString()).send({
      from: governor,
    });
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
    const instance = await artifacts.require("StableToken");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.burn(governor, "100").send({
        from: notOwner,
      }),
      "AccessControl: caller is not allowed"
    );
  });
});
