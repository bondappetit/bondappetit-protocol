const {contract, assert, bn} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("BuybackDepositaryBalanceView.balance", ({web3, artifacts}) => {
  const customer = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const {USDC} = development.assets;

  it("balance: should return balances of all allowed tokens in contract", async () => {
    const [instance] = await artifacts.requireAll(
      "UsdcBuybackDepositaryBalanceView"
    );
    const usdc = new web3.eth.Contract(
      development.contracts.Stable.abi,
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
