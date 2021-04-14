const {contract, assert, bn} = require("../../../utils/test");

contract("BuybackDepositaryBalanceView.balance", ({web3, artifacts}) => {
  const network = artifacts.network;
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {USDC} = network.assets;

  it("balance: should return balances of all allowed tokens in contract", async () => {
    const [instance] = await artifacts.requireAll(
      "UsdcBuybackDepositaryBalanceView"
    );
    const usdc = new web3.eth.Contract(
      network.contracts.Stable.abi,
      USDC.address
    );
    const amount = "100";

    await usdc.methods
      .transfer(instance._address, amount)
      .send({from: customer});

    assert.equal(
      await instance.methods.balance().call(),
      `100${"0".repeat(12)}`,
      "Invalid balance"
    );
  });
});
