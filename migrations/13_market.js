const {delay} = require("./utils");
const networks = require("../networks");
const ABT = artifacts.require("ABT");
const Bond = artifacts.require("Bond");
const Market = artifacts.require("Market");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
    assets: {USDC},
    contracts: {UniswapV2Router02, UniswapAnchoredView},
  } = networks[network];

  await deployer.deploy(
    Market,
    USDC.address,
    ABT.address,
    Bond.address,
    UniswapV2Router02.address,
    UniswapV2Router02.address,
    {
      from: Governor.address,
    }
  );

  if (network !== "development") await delay(30000);
};
