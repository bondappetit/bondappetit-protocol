const assertions = require("truffle-assertions");
const {utils} = require("web3");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("Bond.mint", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("mint: should mint tokens", async () => {
    const instance = await Bond.deployed();

    const startSupply = await instance.totalSupply();
    const startBalance = await instance.balanceOf(governor);

    const mintAmount = utils.toBN("100");
    await instance.mint(governor, mintAmount, {
      from: governor,
    });

    const endSuppty = await instance.totalSupply();
    const endBalance = await instance.balanceOf(governor);
    assert.equal(
      endSuppty,
      startSupply.add(mintAmount).toString(),
      "Total supply update after minted failed"
    );
    assert.equal(
      endBalance,
      startBalance.add(mintAmount).toString(),
      "Balance update after minted failed"
    );
  });

  it("mint: should revert tx if sender not owner", async () => {
    const instance = await Bond.deployed();

    const notOwner = accounts[1];
    const mintAmount = utils.toBN("100");
    await assertions.reverts(
      instance.mint(governor, mintAmount, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
