const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("Bond.burn", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("burn: should burn tokens", async () => {
    const instance = await Bond.deployed();

    const startSupply = await instance.totalSupply();
    const startBalance = await instance.balanceOf(governor);

    const burnAmount = utils.toBN("100");
    await instance.burn(governor, burnAmount, {
      from: governor,
    });

    const endSuppty = await instance.totalSupply();
    const endBalance = await instance.balanceOf(governor);
    assert.equal(
      endSuppty,
      startSupply.sub(burnAmount).toString(),
      "Total supply update after burned failed"
    );
    assert.equal(
      endBalance,
      startBalance.sub(burnAmount).toString(),
      "Balance update after burned failed"
    );
  });

  it("burn: should revert tx if sender not owner", async () => {
    const instance = await Bond.deployed();

    const notOwner = accounts[1];
    const burnAmount = utils.toBN("100");
    await assertions.reverts(
      instance.burn(governor, burnAmount, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
