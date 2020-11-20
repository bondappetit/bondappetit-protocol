const {delay} = require("./utils");
const networks = require("../networks");
const ABT = artifacts.require("ABT");
const Bond = artifacts.require("Bond");
const Market = artifacts.require("Market");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
    assets: {USDC, USDT, DAI, WBTC, WETH},
    contracts: {UniswapV2Router02, UniswapAnchoredView},
  } = networks[network];
  const allowedTokens = [
    {address: USDT.address, symbol: USDT.symbol},
    {address: USDC.address, symbol: USDC.symbol},
    {address: DAI.address, symbol: DAI.symbol},
    {address: WBTC.address, symbol: 'BTC'},
    {address: WETH.address, symbol: 'ETH'},
  ];

  await deployer.deploy(
    Market,
    USDC.address,
    ABT.address,
    Bond.address,
    UniswapV2Router02.address,
    UniswapAnchoredView.address,
    {
      from: Governor.address,
    }
  );

  const market = await Market.deployed();
  await Promise.all(
    allowedTokens.map(({address, symbol}) => market.allowToken(address, symbol))
  );

  if (network !== "development") await delay(30000);
};
