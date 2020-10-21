const Bond = artifacts.require("Bond");
const Investment = artifacts.require("Investment");

module.exports = async (deployer) => {
  const targetToken = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT
  const dai = "0x6b175474e89094c44da98b954eedeac495271d0f"; // DAI
  //const bond = await Bond.deployed();
  const priceOracle = "0x922018674c12a7F0D394ebEEf9B58F186CdE13c1"; // UniswapAnchoredView
  const uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // UniswapV2Router02

  await deployer.deploy(
    Investment,
    targetToken,
    Bond.address,
    priceOracle,
    uniswapRouter
  );

  const investment = await Investment.deployed();
  await investment.allowToken(targetToken);
  await investment.allowToken(dai);
};
