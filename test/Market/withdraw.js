const assertions = require("truffle-assertions");
const {utils} = require("web3");
const IERC20 = artifacts.require("IERC20");
const Market = artifacts.require("Market");
const {development} = require("../../networks");

contract("Market.withdraw", (accounts) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {USDC} = development.assets;

  it("withdraw: should withdraw cumulative token", async () => {
    const instance = await Market.deployed();
    const usdc = new web3.eth.Contract(IERC20.abi, USDC.address);
    const amount = utils
      .toBN(1)
      .mul(utils.toBN(10).pow(utils.toBN(6)))
      .toString();

    await usdc.methods.transfer(Market.address, amount).send({from: customer});
    const startMarketUSDCBalance = await usdc.methods
      .balanceOf(Market.address)
      .call();
    const startGovernorUSDCBalance = await usdc.methods
      .balanceOf(governor)
      .call();
    assert.equal(
      startMarketUSDCBalance,
      amount,
      "Invalid market start balance"
    );
    assert.equal(
      startGovernorUSDCBalance,
      "0",
      "Invalid governor start balance"
    );

    await instance.withdraw(governor, {from: governor});

    const endMarketUSDCBalance = await usdc.methods
      .balanceOf(Market.address)
      .call();
    const endGovernorUSDCBalance = await usdc.methods
      .balanceOf(governor)
      .call();
    assert.equal(endMarketUSDCBalance, "0", "Invalid market end balance");
    assert.equal(
      endGovernorUSDCBalance,
      amount,
      "Invalid governor end balance"
    );
  });

  it("withdraw: should revert tx if called is not the owner", async () => {
    const instance = await Market.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.withdraw(governor, {from: notOwner}),
      "Ownable: caller is not the owner."
    );
  });
});
