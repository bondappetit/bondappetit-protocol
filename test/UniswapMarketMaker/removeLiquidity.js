const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("UniswapMarketMaker.removeLiquidity", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("removeLiquidity: should add liquidity to pool", async () => {
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
    const lpAddress = await instance.methods.liquidityPair().call();
    const lp = new web3.eth.Contract(development.contracts.Stable.abi, lpAddress);
    const startLpBalance = await lp.methods.balanceOf(instance._address).call();

    const tx = await instance.methods.removeLiquidity(startLpBalance).send({
      from: governor,
      gas: 6000000,
    });
    const endLpBalance = await lp.methods.balanceOf(instance._address).call();
    assert.equal(endLpBalance, "0", "Invalid end lp token balance");
    assert.equal(
      tx.events.LiquidityReduced.returnValues.lp === startLpBalance,
      true,
      "Pay to budget event not emited"
    );
  });
});
