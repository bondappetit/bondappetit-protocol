const {utils} = require("web3");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Buyback.buy", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const UniswapRouter = development.contracts.UniswapV2Router02;

  it("buy: should buyback outcoming token", async () => {
    const [instance, stable, gov] = await artifacts.requireAll(
      "Buyback",
      "StableToken",
      "GovernanceToken"
    );
    const uniswapRouter = new web3.eth.Contract(
      UniswapRouter.abi,
      UniswapRouter.address
    );
    const [, recipient] = artifacts.accounts;
    const stableAmount = "5000";
    const govAmount = "10000";

    await stable.methods
      .mint(governor, utils.toBN(stableAmount).mul(utils.toBN(2)).toString())
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

    await instance.methods
      .changeIncoming(stable._address, governor)
      .send({from: governor});
    await instance.methods.changeRecipient(recipient).send({from: governor});
    const amountsOut = await uniswapRouter.methods
      .getAmountsOut(stableAmount, [stable._address, gov._address])
      .call({from: governor});
    const startGovBalance = await gov.methods.balanceOf(recipient).call();

    await stable.methods
      .approve(instance._address, stableAmount)
      .send({from: governor});
    await instance.methods.buy(stableAmount).send({from: governor, gas: 6000000});
    const endGovBalance = await gov.methods.balanceOf(recipient).call();

    assert.equal(
      endGovBalance,
      bn(startGovBalance).add(bn(amountsOut[1])).toString(),
      "Invalid end buyback balance"
    );
  });
});
