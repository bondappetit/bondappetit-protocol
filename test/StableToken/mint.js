const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("StableToken.mint", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("mint: should mint tokens", async () => {
    const instance = await artifacts.require("StableToken");
    const mintAmount = "100";

    const startSupply = await instance.methods.totalSupply().call();
    const startBalance = await instance.methods.balanceOf(governor).call();

    await instance.methods.mint(governor, mintAmount).send({
      from: governor,
    });
    const endSuppty = await instance.methods.totalSupply().call();
    const endBalance = await instance.methods.balanceOf(governor).call();

    assert.equal(
      endSuppty,
      bn(startSupply).add(bn(mintAmount)).toString(),
      "Total supply update after minted failed"
    );
    assert.equal(
      endBalance,
      bn(startBalance).add(bn(mintAmount)).toString(),
      "Balance update after minted failed"
    );
  });

  it("mint: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("StableToken");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.mint(governor, "100").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
