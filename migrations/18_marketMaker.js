const {afterMigration} = require("./utils");
const networks = require("../networks");
const Bond = artifacts.require("Bond");
const MarketMaker = artifacts.require("MarketMaker");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = networks[network];

  await deployer.deploy(
    MarketMaker,
    USDC.address,
    Bond.address,
    UniswapV2Router02.address,
    {
      from: Governor.address,
    }
  );

  await afterMigration(network);
};
