const networks = require("../networks");
const Bond = artifacts.require("Bond");
const Investment = artifacts.require("Investment");

module.exports = async (deployer, network) => {
  const {
    assets: {USDT, DAI},
    contracts: {UniswapAnchoredView, UniswapV2Router02},
  } = networks[network];

  await deployer.deploy(
    Investment,
    USDT.address,
    Bond.address,
    UniswapAnchoredView.address,
    UniswapV2Router02.address
  );

  const investment = await Investment.deployed();
  await investment.allowToken(USDT.address);
  await investment.allowToken(DAI.address);
};
