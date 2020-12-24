const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("UniswapMarketMaker.addLiquidity", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("addLiquidity: should add liquidity to pool", async () => {
    const [instance, abt, bond] = await artifacts.requireAll(
      "UniswapMarketMaker",
      "ABT",
      "Bond"
    );
    const abtAmount = "5000";
    const bondAmount = "10000";

    await abt.methods.mint(governor, abtAmount).send({from: governor});

    await instance.methods
      .changeIncoming(abt._address, governor)
      .send({from: governor});
    await abt.methods.transfer(instance._address, abtAmount).send({
      from: governor,
      gas: 2000000,
    });
    await bond.methods.transfer(instance._address, bondAmount).send({
      from: governor,
      gas: 2000000,
    });

    await instance.methods
      .addLiquidity(0, 0)
      .send({from: governor, gas: 6000000});
    const endAbtBalance = await abt.methods.balanceOf(instance._address).call();
    const endBondBalance = await bond.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(endAbtBalance, "0", "Invalid end abt balance");
    assert.equal(endBondBalance, "0", "Invalid end bond balance");
  });
});
