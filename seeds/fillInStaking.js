const hardhat = require("hardhat");
const Web3 = require("web3");
const {development} = require("../networks");

async function main() {
  const web3 = new Web3(hardhat.network.config.url);
  const governor = development.accounts.Governor.address;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {
    contracts: {UniswapV2Router02: UniswapRouter, Stable, GovStaking, StableStaking},
    assets: {USDC, Governance},
  } = development;
  const governance = new web3.eth.Contract(Stable.abi, Governance.address);
  const stable = new web3.eth.Contract(Stable.abi, Stable.address);
  const usdc = new web3.eth.Contract(Stable.abi, USDC.address);
  const amount = "1000000000000000000000";

  async function addStakingReward({name, address, abi}, amount) {
    const staking = new web3.eth.Contract(abi, address);

    await governance.methods
      .mint(staking._address, amount)
      .send({from: governor});
    await staking.methods
      .notifyRewardAmount(amount)
      .send({from: governor, gas: 6000000});
    console.log(
      `${name} reward for duration:`,
      await staking.methods.getRewardForDuration().call()
    );
  }

  await addStakingReward(GovStaking, amount);
  await addStakingReward(StableStaking, amount);

  const uniswapRouter = new web3.eth.Contract(
    UniswapRouter.abi,
    UniswapRouter.address
  );
  async function addLiquidity(token, amount) {
    await token.methods.mint(investor, amount).send({from: governor});
    await token.methods
      .approve(UniswapRouter.address, amount)
      .send({from: investor});
    await usdc.methods
      .approve(UniswapRouter.address, "1000000")
      .send({from: investor});
    await uniswapRouter.methods
      .addLiquidity(
        usdc._address,
        token._address,
        "1000000",
        amount,
        "0",
        "0",
        investor,
        Date.now()
      )
      .send({from: investor, gas: 6000000});

    const tokenSymbol = await token.methods.symbol().call();
    const [
      ,
      price,
    ] = await uniswapRouter.methods
      .getAmountsOut("1000000000000000000", [token._address, usdc._address])
      .call();
    console.log(`Price for ${tokenSymbol}: ${price}`);
  }

  await addLiquidity(governance, "2000000000000000000");
  await addLiquidity(stable, "1000000000000000000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
