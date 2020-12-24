const {utils} = require("web3");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Buyback.buy", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const UniswapRouter = development.contracts.UniswapV2Router02;

  it("buy: should buyback outcoming token", async () => {
    const [instance, abt, bond] = await artifacts.requireAll(
      "Buyback",
      "ABT",
      "Bond"
    );
    const uniswapRouter = new web3.eth.Contract(
      UniswapRouter.abi,
      UniswapRouter.address
    );
    const recipient = (await web3.eth.getAccounts())[1];
    const abtAmount = "5000";
    const bondAmount = "10000";

    await abt.methods
      .mint(governor, utils.toBN(abtAmount).mul(utils.toBN(2)).toString())
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

    await instance.methods
      .changeIncoming(abt._address, governor)
      .send({from: governor});
    await instance.methods.changeRecipient(recipient).send({from: governor});
    const amountsOut = await uniswapRouter.methods
      .getAmountsOut(abtAmount, [abt._address, bond._address])
      .call({from: governor});
    const startBondBalance = await bond.methods.balanceOf(recipient).call();

    await abt.methods
      .approve(instance._address, abtAmount)
      .send({from: governor});
    await instance.methods.buy(abtAmount).send({from: governor, gas: 6000000});
    const endBondBalance = await bond.methods.balanceOf(recipient).call();

    assert.equal(
      endBondBalance,
      bn(startBondBalance).add(bn(amountsOut[1])).toString(),
      "Invalid end buyback balance"
    );
  });
});
