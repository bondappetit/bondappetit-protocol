const {utils} = require("web3");
const MarketMaker = artifacts.require("MarketMaker");
const ABT = artifacts.require("ABT");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("MarketMaker.buyLiquidity", (accounts) => {
  const governor = development.accounts.Governor.address;
  const UniswapRouter = development.contracts.UniswapV2Router02;

  it("buyLiquidity: should buy support token and add liquidity to pool", async () => {
    const instance = await MarketMaker.deployed();
    const abt = await ABT.deployed();
    const bond = await Bond.deployed();
    const uniswapRouter = new web3.eth.Contract(
      UniswapRouter.abi,
      UniswapRouter.address
    );
    const abtAmount = "5000";
    const bondAmount = "10000";

    await abt.mint(
      governor,
      utils.toBN(abtAmount).mul(utils.toBN(2)).toString(),
      {from: governor}
    );
    await abt.approve(UniswapRouter.address, abtAmount, {
      from: governor,
      gas: 2000000,
    });
    await bond.approve(UniswapRouter.address, bondAmount, {
      from: governor,
      gas: 2000000,
    });
    await uniswapRouter.methods
      .addLiquidity(
        ABT.address,
        Bond.address,
        abtAmount,
        bondAmount,
        "0",
        "0",
        governor,
        Date.now()
      )
      .send({from: governor, gas: 6000000});
    const startAmountsOut = await uniswapRouter.methods.getAmountsOut(abtAmount, [ABT.address, Bond.address]).call();

    await instance.changeIncoming(ABT.address, governor, {from: governor});
    await abt.approve(MarketMaker.address, abtAmount, {
      from: governor,
      gas: 2000000,
    });

    await instance.buyLiquidity(abtAmount, {from: governor, gas: 6000000});
    const endAmountsOut = await uniswapRouter.methods.getAmountsOut(abtAmount, [ABT.address, Bond.address]).call();
    assert.equal(startAmountsOut[1] > endAmountsOut[1], true, "Invalid support token price");
  });
});
