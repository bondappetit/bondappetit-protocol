const {utils} = require("web3");
const Buyback = artifacts.require("Buyback");
const ABT = artifacts.require("ABT");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("Buyback.buy", (accounts) => {
  const governor = development.accounts.Governor.address;
  const UniswapRouter = development.contracts.UniswapV2Router02;
  const recipient = accounts[1];

  it("buy: should buyback outcoming token", async () => {
    const instance = await Buyback.deployed();
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
        '0',
        '0',
        governor,
        Date.now()
      )
      .send({from: governor, gas: 6000000});

    await instance.changeIncoming(ABT.address, governor, {from: governor});
    await instance.changeRecipient(recipient, {from: governor});
    const amountsOut = await uniswapRouter.methods.getAmountsOut(abtAmount, [ABT.address, Bond.address]).call({from: governor});
    const startBondBalance = await bond.balanceOf(recipient);

    await abt.approve(Buyback.address, abtAmount, {from: governor});
    await instance.buy(abtAmount, {from: governor});
    const endBondBalance = await bond.balanceOf(recipient);

    assert.equal(
      endBondBalance.toString(),
      startBondBalance.add(utils.toBN(amountsOut[1])).toString(),
      "Invalid end buyback balance"
    );
  });
});
