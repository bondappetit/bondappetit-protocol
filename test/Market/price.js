const {contract, assert, bn} = require("../../utils/test");
const {web3, deployments} = require("hardhat");
const {development} = require("../../networks");

contract("Market.price", function () {
  const {USDC} = development.assets;
  const productBalance = `1000${"0".repeat(18)}`;
  const rewardBalance = `500${"0".repeat(18)}`;
  let account;
  let uniswapRouter,
    currencyToken,
    cumulativeToken,
    productToken,
    rewardToken,
    market;

  before(async function () {
    [account] = await web3.eth.getAccounts();

    const UniswapRouter = development.contracts.UniswapV2Router02;
    uniswapRouter = new web3.eth.Contract(
      UniswapRouter.abi,
      UniswapRouter.address
    );

    const currencyTotalSupply = `1000${"0".repeat(18)}`;
    const cumulativeTotalSupply = `5000${"0".repeat(6)}`;
    const productTotalSupply = `100000${"0".repeat(18)}`;
    const rewardTotalSupply = `100000${"0".repeat(18)}`;
    const currencyData = await deployments.deploy("MockERC20", {
      args: ["Currency", "C", currencyTotalSupply],
      from: account,
    });
    currencyToken = new web3.eth.Contract(
      currencyData.abi,
      currencyData.address
    );
    cumulativeToken = new web3.eth.Contract(currencyData.abi, USDC.address);
    const productData = await deployments.deploy("MockERC20", {
      args: ["Product", "P", productTotalSupply],
      from: account,
    });
    productToken = new web3.eth.Contract(productData.abi, productData.address);
    const rewardData = await deployments.deploy("MockERC20", {
      args: ["Reward", "R", rewardTotalSupply],
      from: account,
    });
    rewardToken = new web3.eth.Contract(rewardData.abi, rewardData.address);

    await currencyToken.methods
      .approve(uniswapRouter._address, currencyTotalSupply)
      .send({from: account});
    await cumulativeToken.methods
      .approve(uniswapRouter._address, cumulativeTotalSupply)
      .send({from: account});
    await uniswapRouter.methods
      .addLiquidity(
        currencyToken._address,
        cumulativeToken._address,
        currencyTotalSupply,
        cumulativeTotalSupply,
        0,
        0,
        account,
        Date.now()
      )
      .send({from: account});

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

    await productToken.methods
      .transfer(market._address, productBalance)
      .send({from: account});
    await rewardToken.methods
      .transfer(market._address, rewardBalance)
      .send({from: account});
  });

  it("price: should get product token price and reward amount", async () => {
    const payment = `100${"0".repeat(18)}`;
    const [, expectedPrice] = await uniswapRouter.methods
      .getAmountsOut(payment, [
        currencyToken._address,
        cumulativeToken._address,
      ])
      .call();

    const {product, reward} = await market.methods
      .price(currencyToken._address, payment)
      .call();
    assert.equal(
      product,
      bn(expectedPrice)
        .mul(bn(10).pow(bn(12)))
        .toString(),
      "Invalid product"
    );
    assert.equal(
      reward,
      bn(expectedPrice)
        .mul(bn(10).pow(bn(12)))
        .mul(bn(rewardBalance))
        .div(bn(productBalance))
        .toString(),
      "Invalid reward"
    );
  });

  it("price: should get product token price and reward amount for cumulative currency", async () => {
    const payment = `100${"0".repeat(6)}`;
    const expectedPrice = payment;

    const {product, reward} = await market.methods
      .price(cumulativeToken._address, payment)
      .call();
    assert.equal(
      product,
      bn(expectedPrice)
        .mul(bn(10).pow(bn(12)))
        .toString(),
      "Invalid product"
    );
    assert.equal(
      reward,
      bn(expectedPrice)
        .mul(bn(10).pow(bn(12)))
        .mul(bn(rewardBalance))
        .div(bn(productBalance))
        .toString(),
      "Invalid reward"
    );
  });
});
