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
  const abt = new web3.eth.Contract(ABT.abi, ABT.address);
  const usdc = new web3.eth.Contract(ABT.abi, USDC.address);
  const amount = "1000000000000000000000";

  async function addLiquidity(token, amount) {
    await token.methods.transfer(investor, amount).send({from: governor});
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
    const [, price] = await uniswapRouter.methods
      .getAmountsOut('1000000000000000000', [token._address, usdc._address])
      .call();
    console.log(`Price for ${tokenSymbol}: ${price}`);
  }

  await bond.methods.mint(stackingAddress, amount).send({from: governor});
  const bondBalance = await bond.methods.balanceOf(stackingAddress).call();
  console.log(`Bond balance: ${bondBalance}`);

  await abt.methods.mint(governor, amount).send({from: governor});

  const uniswapRouter = new web3.eth.Contract(
    UniswapRouter.abi,
    UniswapRouter.address
  );

  await addLiquidity(bond, "2000000000000000000");
  await addLiquidity(abt, "1000000000000000000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
