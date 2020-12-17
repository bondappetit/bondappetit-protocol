const {afterMigration} = require("./utils");
const networks = require("../networks");
const Stacking = artifacts.require("Stacking");
const Bond = artifacts.require("Bond");
const Buyback = artifacts.require("Buyback");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
    assets: {USDC},
    contracts: {UniswapV2Router02},
  } = networks[network];

  await deployer.deploy(
    Buyback,
    USDC.address,
    Bond.address,
    Stacking.address,
    UniswapV2Router02.address,
    {
      from: Governor.address,
    }
  );

  await afterMigration(network);
};
