const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");

contract("Market.changeCumulativeToken", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {USDC, USDT} = network.assets;

  it("changeCumulativeToken: should change cumulative token", async () => {
    const instance = await artifacts.require("Market");
    const usdc = new web3.eth.Contract(
      network.contracts.Stable.abi,
      USDC.address
    );
    const newToken = USDT.address.toLowerCase();
    const amount = "1000000";

    const startGovernorUSDCBalance = await usdc.methods
      .balanceOf(governor)
      .call();
    const startCumulativeToken = (await instance.methods.cumulative().call())
      .toLowercase;
    assert.equal(
      startCumulativeToken !== newToken,
      true,
      "Invalid start cumulative token"
    );

    await usdc.methods
      .transfer(instance._address, amount)
      .send({from: customer});
    const startBalance = await usdc.methods.balanceOf(instance._address).call();
    assert.equal(startBalance, amount, "Invalid market start balance");

    await instance.methods
      .changeCumulativeToken(newToken, governor)
      .send({from: governor});
    const endBalance = await usdc.methods.balanceOf(instance._address).call();
    const endGovernorUSDCBalance = await usdc.methods
      .balanceOf(governor)
      .call();
    assert.equal(
      (await instance.methods.cumulative().call()).toLowerCase(),
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
    const instance = await artifacts.require("Market");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods
        .changeCumulativeToken(USDT.address, governor)
        .send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
