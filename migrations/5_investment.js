const bn = require("bn.js");
const networks = require("../networks");
const Bond = artifacts.require("Bond");
const Timelock = artifacts.require("Timelock");
const Investment = artifacts.require("Investment");
const dayjs = require("dayjs");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
    assets: {USDC, USDT, DAI, WETH},
    contracts: {UniswapV2Router02},
  } = networks[network];
  const investmentTokens = [
    USDT.address,
    USDC.address,
    DAI.address,
    WETH.address,
  ];

  await deployer.deploy(
    Investment,
    USDC.address,
    Bond.address,
    dayjs().add(1, "year").unix(),
    UniswapV2Router02.address
  );

  const investment = await Investment.deployed();
  await Promise.all(
    investmentTokens.map((address) => investment.allowToken(address))
  );

  const bond = await Bond.deployed();
  await bond.allowTransferLock(investment.address, {from: Governor.address});
  await bond.transfer(
    investment.address,
    new bn(1200000).mul(new bn("1000000000000000000")).toString(),
    {from: Governor.address}
  );
};
