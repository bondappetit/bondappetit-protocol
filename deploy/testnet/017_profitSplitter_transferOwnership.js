const {migration} = require("../../utils/deploy");
const {utils} = require("web3");

module.exports = migration("ProfitSplitter", async (d) => {
  const {
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();
  const [budget, buyback, uniswapMarketMaker] = await d.deployed(
    "Budget",
    "Buyback",
    "UniswapMarketMaker"
  );
  const budgetConfig = {
    recipient: budget.address,
    balance: utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(18)))
      .toString(),
  };
  const recipients = [
    {
      recipient: buyback.address,
      share: 10,
    },
    {
      recipient: uniswapMarketMaker.address,
      share: 90,
    },
  ];

  await d.deploy("ProfitSplitter", {
    args: [USDC.address, UniswapV2Router02.address],
  });

  await d.send("ProfitSplitter", "changeBudget", [
    budgetConfig.recipient,
    budgetConfig.balance,
  ]);
  await recipients.reduce(async (tx, {recipient, share}) => {
    await tx;
    await d.send("ProfitSplitter", "addRecipient", [recipient, share]);
  }, Promise.resolve());

  await d.toValidator(
    "Budget",
    "Buyback",
    "UniswapMarketMaker",
    "ProfitSplitter"
  );
  if (!d.isDev) {
    await d.toTimelock(
      "Budget",
      "Buyback",
      "UniswapMarketMaker",
      "ProfitSplitter"
    );
  }
});
