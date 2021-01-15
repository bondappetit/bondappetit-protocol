const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("UniswapMarketMaker.buyLiquidity", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const UniswapRouter = development.contracts.UniswapV2Router02;

  it("buyLiquidity: should buy support token and add liquidity to pool", async () => {
    const [instance, stable, gov] = await artifacts.requireAll(
      "UniswapMarketMaker",
      "StableToken",
      "GovernanceToken"
    );
    const uniswapRouter = new web3.eth.Contract(
      UniswapRouter.abi,
      UniswapRouter.address
    );
    const stableAmount = "5000";
    const govAmount = "10000";

    await stable.methods
      .mint(governor, bn(stableAmount).mul(bn(2)).toString())
      .send({from: governor});
    await stable.methods.approve(UniswapRouter.address, stableAmount).send({
      from: governor,
      gas: 2000000,
    });
    await gov.methods.approve(UniswapRouter.address, govAmount).send({
      from: governor,
      gas: 2000000,
    });
    await uniswapRouter.methods
      .addLiquidity(
        stable._address,
        gov._address,
        stableAmount,
        govAmount,
        "0",
        "0",
        governor,
        Date.now()
      )
      .send({from: governor, gas: 6000000});
    const startAmountsOut = await uniswapRouter.methods
      .getAmountsOut(stableAmount, [stable._address, gov._address])
      .call();

    await instance.methods
      .changeIncoming(stable._address, governor)
      .send({from: governor});
    await stable.methods.approve(instance._address, stableAmount).send({
      from: governor,
      gas: 2000000,
    });

    await instance.methods.buyLiquidity(stableAmount).send({from: governor, gas: 6000000});
    const endAmountsOut = await uniswapRouter.methods
      .getAmountsOut(stableAmount, [stable._address, gov._address])
      .call();
    assert.equal(
      startAmountsOut[1] > endAmountsOut[1],
      true,
      "Invalid support token price"
    );
  });
});
