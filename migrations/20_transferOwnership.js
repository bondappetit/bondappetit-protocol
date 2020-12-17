const {afterMigration} = require('./utils');
const networks = require("../networks");
const Timelock = artifacts.require("Timelock");
const Budget = artifacts.require("Budget");
const Buyback = artifacts.require("Buyback");
const UniswapMarketMaker = artifacts.require("UniswapMarketMaker");
const ProfitSplitter = artifacts.require("ProfitSplitter");

module.exports = async (deployer, network) => {
  if (network === "development") return;

  const {
    accounts: {Governor},
  } = networks[network];

  const [
    budget,
    buyback,
    uniswapMarketMaker,
    profitSplitter
  ] = await Promise.all([
    Budget.deployed(),
    Buyback.deployed(),
    UniswapMarketMaker.deployed(),
    ProfitSplitter.deployed(),
  ])
  await budget.transferOwnership(Timelock.address, {from: Governor.address});
  await buyback.transferOwnership(Timelock.address, {from: Governor.address});
  await uniswapMarketMaker.transferOwnership(Timelock.address, {from: Governor.address});
  await profitSplitter.transferOwnership(Timelock.address, {from: Governor.address});
 
  await afterMigration(network);
};
