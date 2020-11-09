const Bond = artifacts.require("Bond");
const {utils} = require("web3");

contract("Bond", (accounts) => {
  const [accA, accB] = accounts;

  it("transfer: should transfer token", async () => {
    const instance = await Bond.deployed();
    const amount = 10;

    const [startBalanceA, startBalanceB] = await Promise.all([
      instance.balanceOf.call(accA),
      instance.balanceOf.call(accB),
    ]);

    await instance.transfer(accB, amount, {from: accA});

    const [endBalanceA, endBalanceB] = await Promise.all([
      instance.balanceOf.call(accA),
      instance.balanceOf.call(accB),
    ]);

    assert.equal(
      endBalanceA.toString(),
      startBalanceA.sub(utils.toBN(amount)).toString(),
      "Amount wasn't correctly taken from the sender"
    );
    assert.equal(
      endBalanceB.toString(),
      startBalanceB.add(utils.toBN(amount)).toString(),
      "Amount wasn't correctly taken from the recipient"
    );
  });
});