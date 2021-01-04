const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.withdraw", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {USDC} = development.assets;

  it("withdraw: should withdraw cumulative token", async () => {
    const instance = await artifacts.require("Market");
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
      USDC.address
    );
    const amount = bn(1)
      .mul(bn(10).pow(bn(6)))
      .toString();

    await usdc.methods.transfer(instance._address, amount).send({from: customer});
    const startMarketUSDCBalance = await usdc.methods
      .balanceOf(instance._address)
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

    await instance.methods.withdraw(governor).send({from: governor});

    const endMarketUSDCBalance = await usdc.methods
      .balanceOf(instance._address)
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
    const instance = await artifacts.require("Market");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.withdraw(governor).send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
