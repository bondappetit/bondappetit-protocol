const assertions = require("truffle-assertions");
const Market = artifacts.require("Market");
const IERC20 = artifacts.require("IERC20");
const {development} = require("../../networks");

contract("Market.changeCumulativeToken", (accounts) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {USDC, USDT} = development.assets;

  it("changeCumulativeToken: should change cumulative token", async () => {
    const instance = await Market.deployed();
    const usdc = new web3.eth.Contract(IERC20.abi, USDC.address);
    const newToken = USDT.address.toLowerCase();
    const amount = "1000000";

    const startCumulativeToken = (await instance.cumulative()).toLowercase;
    assert.equal(
      startCumulativeToken !== newToken,
      true,
      "Invalid start cumulative token"
    );

    await usdc.methods.transfer(Market.address, amount).send({from: customer});
    const startBalance = await usdc.methods.balanceOf(Market.address).call();
    assert.equal(startBalance, amount, "Invalid market start balance");

    await instance.changeCumulativeToken(newToken, governor, {from: governor});
    const endBalance = await usdc.methods.balanceOf(Market.address).call();
    const governorUSDCBalance = await usdc.methods.balanceOf(governor).call();
    assert.equal(
      (await instance.cumulative()).toLowerCase(),
      newToken,
      "Invalid cumulative token"
    );
    assert.equal(endBalance, "0", "Invalid market end balance");
    assert.equal(governorUSDCBalance, amount, "Invalid governor end balance");
  });

  it("changeCumulativeToken: should revert tx if called is not the owner", async () => {
    const instance = await Market.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.changeCumulativeToken(USDT.address, governor, {from: notOwner}),
      "Ownable: caller is not the owner."
    );
  });
});
