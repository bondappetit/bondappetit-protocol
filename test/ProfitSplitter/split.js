const assertions = require("truffle-assertions");
const {utils} = require("web3");
const ProfitSplitter = artifacts.require("ProfitSplitter");
const ABT = artifacts.require("ABT");
const Budget = artifacts.require("Budget");
const MarketMaker = artifacts.require("MarketMaker");
const Buyback = artifacts.require("Buyback");
const {development} = require("../../networks");

contract("ProfitSplitter.split", () => {
  const governor = development.accounts.Governor.address;
  const UniswapRouter = development.contracts.UniswapV2Router02;

  it("split: should split incoming tokens to all recipients ", async () => {
    const instance = await ProfitSplitter.deployed();
    const abt = await ABT.deployed();
    const uniswapRouter = new web3.eth.Contract(
      UniswapRouter.abi,
      UniswapRouter.address
    );
    const amount = "200";
    const budgetAmount = "50000";

    await abt.mint(governor, "300", {from: governor});
    await abt.approve(UniswapRouter.address, "100", {from: governor});
    await uniswapRouter.methods
      .addLiquidityETH(ABT.address, "100", "0", "0", governor, Date.now())
      .send({from: governor, value: 1000000, gas: 6000000});

    const recipients = await instance.getRecipients();
    await Promise.all(
      recipients.map((recipient) => instance.removeRecipient(recipient))
    );
    await instance.changeIncoming(ABT.address, governor, {from: governor});
    await instance.changeBudget(Budget.address, budgetAmount);
    await instance.addRecipient(MarketMaker.address, 80);
    await instance.addRecipient(Buyback.address, 20);

    const startBudgetBalance = await web3.eth.getBalance(Budget.address);
    const startMarketMakerBalance = await abt.balanceOf(MarketMaker.address);
    const startBuybackBalance = await abt.balanceOf(Buyback.address);

    await abt.approve(ProfitSplitter.address, amount, {from: governor});
    const tx = await instance.split(amount);
    assertions.eventEmitted(
      tx,
      "PayToBudget",
      (ev) => ev.recipient === Budget.address
    );
    assertions.eventEmitted(tx, "PayToRecipient", (ev) =>
      [MarketMaker.address, Buyback.address].includes(ev.recipient)
    );

    const endBudgetBalance = await web3.eth.getBalance(Budget.address);
    const endMarketMakerBalance = await abt.balanceOf(MarketMaker.address);
    const endBuybackBalance = await abt.balanceOf(Buyback.address);
    assert.equal(
      endBudgetBalance.toString() > startBudgetBalance.toString(),
      true,
      "Invalid end budget balance"
    );
    assert.equal(
      endMarketMakerBalance.toString() > startMarketMakerBalance.toString(),
      true,
      "Invalid end market maker balance"
    );
    assert.equal(
      endBuybackBalance.toString() > startBuybackBalance.toString(),
      true,
      "Invalid end buyback balance"
    );
  });
});
