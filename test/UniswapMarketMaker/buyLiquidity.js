const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("UniswapMarketMaker.buyLiquidity", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const UniswapRouter = development.contracts.UniswapV2Router02;

  it("buyLiquidity: should buy support token and add liquidity to pool", async () => {
    const [instance, abt, bond] = await artifacts.requireAll(
      "UniswapMarketMaker",
      "ABT",
      "Bond"
    );
    const uniswapRouter = new web3.eth.Contract(
      UniswapRouter.abi,
      UniswapRouter.address
    );
    const abtAmount = "5000";
    const bondAmount = "10000";

    await abt.methods
      .mint(governor, bn(abtAmount).mul(bn(2)).toString())
      .send({from: governor});
    await abt.methods.approve(UniswapRouter.address, abtAmount).send({
      from: governor,
      gas: 2000000,
    });
    await bond.methods.approve(UniswapRouter.address, bondAmount).send({
      from: governor,
      gas: 2000000,
    });
    await uniswapRouter.methods
      .addLiquidity(
        abt._address,
        bond._address,
        abtAmount,
        bondAmount,
        "0",
        "0",
        governor,
        Date.now()
      )
      .send({from: governor, gas: 6000000});
    const startAmountsOut = await uniswapRouter.methods
      .getAmountsOut(abtAmount, [abt._address, bond._address])
      .call();

    await instance.methods
      .changeIncoming(abt._address, governor)
      .send({from: governor});
    await abt.methods.approve(instance._address, abtAmount).send({
      from: governor,
      gas: 2000000,
    });

    await instance.methods.buyLiquidity(abtAmount).send({from: governor, gas: 6000000});
    const endAmountsOut = await uniswapRouter.methods
      .getAmountsOut(abtAmount, [abt._address, bond._address])
      .call();
    assert.equal(
      startAmountsOut[1] > endAmountsOut[1],
      true,
      "Invalid support token price"
    );
  });
});
