const MarketMaker = artifacts.require("MarketMaker");
const ABT = artifacts.require("ABT");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("MarketMaker.addLiquidity", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("addLiquidity: should add liquidity to pool", async () => {
    const instance = await MarketMaker.deployed();
    const abt = await ABT.deployed();
    const bond = await Bond.deployed();
    const abtAmount = "5000";
    const bondAmount = "10000";

    await abt.mint(governor, abtAmount, {from: governor});

    await instance.changeIncoming(ABT.address, governor, {from: governor});
    await abt.transfer(MarketMaker.address, abtAmount, {
      from: governor,
      gas: 2000000,
    });
    await bond.transfer(MarketMaker.address, bondAmount, {
      from: governor,
      gas: 2000000,
    });

    await instance.addLiquidity(0, 0, {from: governor, gas: 6000000});
    const endAbtBalance = await abt.balanceOf(MarketMaker.address);
    const endBondBalance = await bond.balanceOf(MarketMaker.address);
    assert.equal(endAbtBalance.toString(), "0", "Invalid end abt balance");
    assert.equal(endBondBalance.toString(), "0", "Invalid end bond balance");
  });
});
