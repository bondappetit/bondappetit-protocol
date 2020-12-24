const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("ProfitSplitter.split", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const {
    UniswapV2Router02,
    UniswapMarketMaker,
    Buyback,
    Budget,
  } = development.contracts;

  it("split: should split incoming tokens to all recipients ", async () => {
    const [instance, abt] = await artifacts.requireAll("ProfitSplitter", "ABT");
    const uniswapRouter = new web3.eth.Contract(
      UniswapV2Router02.abi,
      UniswapV2Router02.address
    );
    const amount = "200";
    const budgetAmount = "50000";

    await abt.methods.mint(governor, "300").send({from: governor});
    await abt.methods
      .approve(UniswapV2Router02.address, "100")
      .send({from: governor, gas: 2000000});
    await uniswapRouter.methods
      .addLiquidityETH(abt._address, "100", "0", "0", governor, Date.now())
      .send({from: governor, value: 1000000, gas: 6000000});

    const recipients = await instance.methods.getRecipients().call();
    await Promise.all(
      recipients.map((recipient) =>
        instance.methods
          .removeRecipient(recipient)
          .send({from: governor, gas: 2000000})
      )
    );
    await instance.methods
      .changeIncoming(abt._address, governor)
      .send({from: governor, gas: 2000000});
    await instance.methods
      .changeBudget(Budget.address, budgetAmount)
      .send({from: governor, gas: 2000000});
    await instance.methods
      .addRecipient(UniswapMarketMaker.address, 80)
      .send({from: governor, gas: 2000000});
    await instance.methods
      .addRecipient(Buyback.address, 20)
      .send({from: governor, gas: 2000000});

    const startBudgetBalance = await web3.eth.getBalance(Budget.address);
    const startMarketMakerBalance = await abt.methods
      .balanceOf(UniswapMarketMaker.address)
      .call();
    const startBuybackBalance = await abt.methods
      .balanceOf(Buyback.address)
      .call();

    await abt.methods
      .approve(instance._address, amount)
      .send({from: governor, gas: 2000000});
    const tx = await instance.methods
      .split(amount)
      .send({from: governor, gas: 6000000});
    assert.equal(
      tx.events.PayToBudget.returnValues.recipient === Budget.address,
      true,
      "Pay to budget event not emited"
    );
    assert.equal(
      tx.events.PayToRecipient.length,
      2,
      "Pay to recipient event not emited"
    );

    const endBudgetBalance = await web3.eth.getBalance(Budget.address);
    const endMarketMakerBalance = await abt.methods
      .balanceOf(UniswapMarketMaker.address)
      .call();
    const endBuybackBalance = await abt.methods
      .balanceOf(Buyback.address)
      .call();
    assert.equal(
      endBudgetBalance > startBudgetBalance,
      true,
      "Invalid end budget balance"
    );
    assert.equal(
      endMarketMakerBalance > startMarketMakerBalance,
      true,
      "Invalid end market maker balance"
    );
    assert.equal(
      endBuybackBalance > startBuybackBalance,
      true,
      "Invalid end buyback balance"
    );
  });
});
