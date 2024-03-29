const assertions = require("truffle-assertions");
const {web3, deployments} = require("hardhat");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.changeCumulativeToken", () => {
  let account, notOwner;
  let uniswapRouter,
    currencyToken,
    cumulativeToken,
    productToken,
    rewardToken,
    market;
  const {USDT} = development.assets;

  before(async function () {
    [account, notOwner] = await web3.eth.getAccounts();

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

  it("changeCumulativeToken: should change cumulative token", async () => {
    const newToken = USDT.address.toLowerCase();
    const amount = "1000000";

    await cumulativeToken.methods
      .transfer(market._address, amount)
      .send({from: account});
    const startGovernorUSDCBalance = await cumulativeToken.methods
      .balanceOf(account)
      .call();
    const startCumulativeToken = (
      await market.methods.cumulativeToken().call()
    ).toLowerCase();
    assert.equal(
      startCumulativeToken !== newToken,
      true,
      "Invalid start cumulative token"
    );

    const startBalance = await cumulativeToken.methods
      .balanceOf(market._address)
      .call();
    assert.equal(startBalance, amount, "Invalid market start balance");

    await market.methods
      .changeCumulativeToken(newToken, account)
      .send({from: account});
    const endBalance = await cumulativeToken.methods
      .balanceOf(market._address)
      .call();
    const endGovernorUSDCBalance = await cumulativeToken.methods
      .balanceOf(account)
      .call();
    assert.equal(
      (await market.methods.cumulativeToken().call()).toLowerCase(),
      newToken,
      "Invalid cumulative token"
    );
    assert.equal(endBalance, "0", "Invalid market end balance");
    assert.equal(
      endGovernorUSDCBalance,
      bn(startGovernorUSDCBalance).add(bn(amount)).toString(),
      "Invalid governor end balance"
    );
  });

  it("changeCumulativeToken: should revert tx if called is not the owner", async () => {
    await assertions.reverts(
      market.methods
        .changeCumulativeToken(USDT.address, account)
        .send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
