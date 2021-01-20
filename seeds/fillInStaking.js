const hardhat = require("hardhat");
const Web3 = require("web3");
const {development} = require("../networks");

async function main() {
  const web3 = new Web3(hardhat.network.config.url);
  const governor = development.accounts.Governor.address;
  const {
    contracts: {
      UniswapV2Router02: UniswapRouter,
      UniswapV2Factory: UniswapFactory,
      Stable,
      GovStaking,
      StableStaking,
      UsdcGovLPStaking,
      UsdcStableLPStaking,
      GovStableLPStaking,
      WethGovLPStaking,
    },
    assets: {USDC, Governance, WETH},
  } = development;
  const gov = new web3.eth.Contract(Stable.abi, Governance.address);
  const stable = new web3.eth.Contract(Stable.abi, Stable.address);
  const usdc = new web3.eth.Contract(Stable.abi, USDC.address);

  async function addStakingReward({name, address, abi}, amount) {
    const staking = new web3.eth.Contract(abi, address);

    await gov.methods.mint(staking._address, amount).send({from: governor});
    await staking.methods
      .notifyRewardAmount(amount)
      .send({from: governor, gas: 6000000});
    console.log(
      `${name} reward for duration:`,
      await staking.methods.getRewardForDuration().call()
    );
  }

  const amount = "1000000000000000000000";
  await addStakingReward(GovStaking, amount);
  await addStakingReward(StableStaking, amount);
  await addStakingReward(UsdcGovLPStaking, amount);
  await addStakingReward(UsdcStableLPStaking, amount);
  await addStakingReward(GovStableLPStaking, amount);
  await addStakingReward(WethGovLPStaking, amount);

  const uniswapRouter = new web3.eth.Contract(
    UniswapRouter.abi,
    UniswapRouter.address
  );
  const uniswapFactory = new web3.eth.Contract(
    UniswapFactory.abi,
    UniswapFactory.address
  );

  async function addLiquidity(tokenA, tokenB, amountA, amountB) {
    const lpAddress = await uniswapFactory.methods
      .getPair(tokenA._address, tokenB._address)
      .call();
    console.log(`Liquidity pool pair address: ${lpAddress}`);

    await tokenA.methods
      .approve(UniswapRouter.address, amountA)
      .send({from: governor});
    await tokenB.methods
      .approve(UniswapRouter.address, amountB)
      .send({from: governor});
    await uniswapRouter.methods
      .addLiquidity(
        tokenA._address,
        tokenB._address,
        amountA,
        amountB,
        "0",
        "0",
        governor,
        Date.now()
      )
      .send({from: governor, gas: 6000000});

    const [tokenASymbol, tokenBSymbol] = await Promise.all([
      tokenA.methods.symbol().call(),
      tokenB.methods.symbol().call(),
    ]);
    const [, price] = await uniswapRouter.methods
      .getAmountsOut(amountA, [tokenA._address, tokenB._address])
      .call();
    console.log(`Price for ${tokenASymbol}-${tokenBSymbol}: ${price}`);
  }

  async function addLiquidityETH(token, amount, amountETH) {
    const lpAddress = await uniswapFactory.methods
      .getPair(WETH.address, token._address)
      .call();
    console.log(`Liquidity pool pair address: ${lpAddress}`);

    await token.methods
      .approve(UniswapRouter.address, amount)
      .send({from: governor});
    await uniswapRouter.methods
      .addLiquidityETH(token._address, amount, "0", "0", governor, Date.now())
      .send({value: amountETH, from: governor, gas: 6000000});

    const tokenSymbol = await token.methods.symbol().call();
    const [, price] = await uniswapRouter.methods
      .getAmountsOut(amount, [token._address, WETH.address])
      .call();
    console.log(`Price for ${tokenSymbol}-${WETH.symbol}: ${price}`);
  }

  await gov.methods
    .mint(governor, "3000000000000000000")
    .send({from: governor});
  await stable.methods
    .mint(governor, "2000000000000000000")
    .send({from: governor});
  await addLiquidity(gov, usdc, "1000000000000000000", "1000000");
  await addLiquidity(stable, usdc, "1000000000000000000", "1000000");
  await addLiquidity(gov, stable, "1000000000000000000", "1000000000000000000");
  await addLiquidityETH(gov, "1000000000000000000", "1000000000000000000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
