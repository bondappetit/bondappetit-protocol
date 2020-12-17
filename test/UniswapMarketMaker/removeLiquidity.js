const assertions = require("truffle-assertions");
const UniswapMarketMaker = artifacts.require("UniswapMarketMaker");
const ABT = artifacts.require("ABT");
const Bond = artifacts.require("Bond");
const ERC20 = artifacts.require("ERC20");
const {development} = require("../../networks");

contract("UniswapMarketMaker.addLiquidity", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("addLiquidity: should add liquidity to pool", async () => {
    const instance = await UniswapMarketMaker.deployed();
    const abt = await ABT.deployed();
    const bond = await Bond.deployed();
    const abtAmount = "5000";
    const bondAmount = "10000";

    await abt.mint(governor, abtAmount, {from: governor});

    await instance.changeIncoming(ABT.address, governor, {from: governor});
    await abt.transfer(UniswapMarketMaker.address, abtAmount, {
      from: governor,
      gas: 2000000,
    });
    await bond.transfer(UniswapMarketMaker.address, bondAmount, {
      from: governor,
      gas: 2000000,
    });

    await instance.addLiquidity(0, 0, {from: governor, gas: 6000000});
    const lpAddress = await instance.liquidityPair();
    const lp = new web3.eth.Contract(ERC20.abi, lpAddress);
    const startLpBalance = await lp.methods
      .balanceOf(UniswapMarketMaker.address)
      .call();

    const tx = await instance.removeLiquidity(startLpBalance, {
      from: governor,
      gas: 6000000,
    });
    const endLpBalance = await lp.methods
      .balanceOf(UniswapMarketMaker.address)
      .call();
    assert.equal(endLpBalance.toString(), "0", "Invalid end lp token balance");
    assertions.eventEmitted(
      tx,
      "LiquidityRemoved",
      (ev) => ev.lp.toString() === startLpBalance.toString()
    );
  });
});
