const {migration} = require("../../utils/deploy");
const {utils} = require("web3");

module.exports = migration("LiquidityPools", async (d) => {
  const {
    assets: {USDC, WETH},
    contracts: {UniswapV2Router02: UniswapRouter, Stable},
  } = d.getNetwork();
  const deployer = d.getGovernor().address;
  const uniswapRouter = new d.web3.eth.Contract(
    UniswapRouter.abi,
    UniswapRouter.address
  );
  const usdc = new d.web3.eth.Contract(Stable.abi, USDC.address);

  await usdc.methods
    .approve(uniswapRouter.options.address, `10${"0".repeat(USDC.decimals)}`)
    .send({from: deployer});
  await uniswapRouter.methods
    .addLiquidityETH(
      USDC.address,
      `10${"0".repeat(USDC.decimals)}`,
      0,
      0,
      deployer,
      Date.now()
    )
    .send({
      from: deployer,
      gas: 6000000,
      value: `1${"0".repeat(WETH.decimals)}`,
    });
});
