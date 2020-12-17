const {afterMigration} = require("./utils");
const {utils} = require("web3");
const networks = require("../networks");
const Budget = artifacts.require("Budget");
const Buyback = artifacts.require("Buyback");
const UniswapMarketMaker = artifacts.require("UniswapMarketMaker");
const ProfitSplitter = artifacts.require("ProfitSplitter");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = networks[network];
  const budget = {
    recipient: Budget.address,
    balance: utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(18)))
      .toString(),
  };
  const recipients = [
    {
      recipient: Buyback.address,
      share: 10,
    },
    {
      recipient: UniswapMarketMaker.address,
      share: 90,
    },
  ];

  await deployer.deploy(
    ProfitSplitter,
    USDC.address,
    UniswapV2Router02.address,
    {
      from: Governor.address,
    }
  );

  const splitter = await ProfitSplitter.deployed();
  await splitter.changeBudget(budget.recipient, budget.balance);
  await Promise.all(
    recipients.map(({recipient, share}) =>
      splitter.addRecipient(recipient, share)
    )
  );

  await afterMigration(network);
};
