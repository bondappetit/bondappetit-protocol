const {afterMigration} = require("./utils");
const networks = require("../networks");
const Bond = artifacts.require("Bond");
const UniswapMarketMaker = artifacts.require("UniswapMarketMaker");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = networks[network];

  await deployer.deploy(
    UniswapMarketMaker,
    USDC.address,
    Bond.address,
    UniswapV2Router02.address,
    {
      from: Governor.address,
    }
  );

  await afterMigration(network);
};
