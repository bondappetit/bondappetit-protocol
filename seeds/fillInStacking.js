const hardhat = require("hardhat");
const Web3 = require("web3");
const {development} = require("../networks");
const bn = Web3.utils.toBN.bind(Web3.utils);

async function main() {
  const web3 = new Web3(hardhat.network.config.url);
  const governor = development.accounts.Governor.address;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {
    contracts: {UniswapV2Router02: UniswapRouter, ABT},
    assets: {USDC, Bond},
  } = development;
  const {address: stackingAddress} = await hardhat.deployments.get("Stacking");
  const bond = new web3.eth.Contract(ABT.abi, Bond.address);
  const usdc = new web3.eth.Contract(ABT.abi, USDC.address);
  const amount = "1000000000000000000000";
  const lpAmount = "10000000";

  await bond.methods.mint(stackingAddress, amount).send({from: governor});
  const bondBalance = await bond.methods.balanceOf(stackingAddress).call();
  console.log(`Bond balance: ${bondBalance}`);

  const uniswapRouter = new web3.eth.Contract(
    UniswapRouter.abi,
    UniswapRouter.address
  );

  await bond.methods.transfer(investor, lpAmount).send({from: governor});
  await bond.methods
    .approve(UniswapRouter.address, lpAmount)
    .send({from: investor});
  await usdc.methods
    .approve(UniswapRouter.address, lpAmount)
    .send({from: investor});
  await uniswapRouter.methods
    .addLiquidity(
      usdc._address,
      bond._address,
      lpAmount,
      lpAmount,
      "0",
      "0",
      investor,
      Date.now()
    )
    .send({from: investor, gas: 6000000});
  const [, bondPrice] = await uniswapRouter.methods.getAmountsOut("1000000", [
    bond._address,
    usdc._address,
  ]).call();
  console.log(`Bond price: ${bondPrice}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
