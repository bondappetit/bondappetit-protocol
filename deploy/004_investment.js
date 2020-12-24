const {migration} = require("../utils/deploy");
const dayjs = require("dayjs");
const bn = require("bn.js");

module.exports = migration("Investment", async (d) => {
  const {
    assets: {USDC, USDT, DAI, WETH},
    contracts: {UniswapV2Router02},
  } = d.getNetwork();
  const investmentTokens = [
    USDT.address,
    USDC.address,
    DAI.address,
    WETH.address,
  ];
  const lockDate = dayjs().add(1, "year").unix();
  const bondAmount = new bn(1200000)
    .mul(new bn("1000000000000000000"))
    .toString();

  const [bond] = await d.deployed("Bond");
  const investment = await d.deploy("Investment", {
    args: [USDC.address, bond.address, lockDate, UniswapV2Router02.address],
  });
  await investmentTokens.reduce(async (tx, address) => {
    await tx;
    return d.send("Investment", "allowToken", [address]);
  }, Promise.resolve());

  await d.send("Bond", "allowTransferLock", [investment.address]);
  await d.send("Bond", "transfer", [investment.address, bondAmount]);
});
