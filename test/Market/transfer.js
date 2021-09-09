const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {web3, deployments} = require("hardhat");
const {development} = require("../../networks");

contract("Market.transfer", () => {
  let account, recipient, notOwner;
  let uniswapRouter,
    currencyToken,
    cumulativeToken,
    productToken,
    rewardToken,
    market;

  before(async function () {
    [account, recipient, notOwner] = await web3.eth.getAccounts();

    const UniswapRouter = development.contracts.UniswapV2Router02;
    uniswapRouter = new web3.eth.Contract(
      UniswapRouter.abi,
      UniswapRouter.address
    );

    const currencyData = await deployments.deploy("MockERC20", {
      args: ["Currency", "C", `1000${"0".repeat(18)}`],
      from: account,
    });
    currencyToken = new web3.eth.Contract(
      currencyData.abi,
      currencyData.address
    );
    const cumulativeData = await deployments.deploy("MockERC20", {
      args: ["Cumulative", "CM", `1000${"0".repeat(18)}`],
      from: account,
    });
    cumulativeToken = new web3.eth.Contract(
      cumulativeData.abi,
      cumulativeData.address
    );
    const productData = await deployments.deploy("MockERC20", {
      args: ["Product", "P", `100000${"0".repeat(18)}`],
      from: account,
    });
    productToken = new web3.eth.Contract(productData.abi, productData.address);
    const rewardData = await deployments.deploy("MockERC20", {
      args: ["Reward", "R", `100000${"0".repeat(18)}`],
      from: account,
    });
    rewardToken = new web3.eth.Contract(rewardData.abi, rewardData.address);

    const marketData = await deployments.deploy("Market", {
      args: [
        cumulativeToken._address,
        productToken._address,
        rewardToken._address,
        uniswapRouter._address,
      ],
      from: account,
    });
    market = new web3.eth.Contract(marketData.abi, marketData.address);
  });

  it("transfer: should transfer token", async () => {
    const amount = "1000000";

    assert.equal(
      await productToken.methods.balanceOf(recipient).call(),
      "0",
      "Invalid start balance"
    );

    await productToken.methods
      .transfer(market._address, amount)
      .send({from: account});
    await market.methods
      .transfer(productToken._address, recipient, amount)
      .send({from: account});
    assert.equal(
      await productToken.methods.balanceOf(recipient).call(),
      amount,
      "Invalid end balance"
    );
  });

  it("transfer: should revert tx if called is not the owner", async () => {
    await assertions.reverts(
      market.methods
        .transfer(productToken._address, notOwner, "1000000")
        .send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
