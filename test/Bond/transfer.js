const {contract, assert, bn} = require("../../utils/test");

contract("Bond.transfer", ({web3, artifacts}) => {
  it("transfer: should transfer token", async () => {
    const instance = await artifacts.require("Bond");
    const [accA, accB] = await web3.eth.getAccounts();
    const amount = "10";

    const [startBalanceA, startBalanceB] = await Promise.all([
      instance.methods.balanceOf(accA).call(),
      instance.methods.balanceOf(accB).call(),
    ]);

    await instance.methods.transfer(accB, amount).send({from: accA});

    const [endBalanceA, endBalanceB] = await Promise.all([
      instance.methods.balanceOf(accA).call(),
      instance.methods.balanceOf(accB).call(),
    ]);

    assert.equal(
      endBalanceA,
      bn(startBalanceA).sub(bn(amount)).toString(),
      "Amount wasn't correctly taken from the sender"
    );
    assert.equal(
      endBalanceB,
      bn(startBalanceB).add(bn(amount)).toString(),
      "Amount wasn't correctly taken from the recipient"
    );
  });
});
