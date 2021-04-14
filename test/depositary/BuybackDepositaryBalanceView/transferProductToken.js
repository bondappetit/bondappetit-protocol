const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../../utils/test");

contract(
  "BuybackDepositaryBalanceView.transferProductToken",
  ({web3, artifacts}) => {
    const network = artifacts.network;
    const governor = network.accounts.Governor.address;
    const donor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
    const {USDC} = network.assets;

    it("transferProductToken: should transfer product token", async () => {
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
        .send({from: donor});
      const startGovernorUsdcBalance = await usdc.methods
        .balanceOf(governor)
        .call();

      await instance.methods
        .transferProductToken(governor, amount)
        .send({from: governor, gas: 6000000});

      assert.equal(
        await usdc.methods.balanceOf(instance._address).call(),
        "0",
        "Invalid end depositary balance"
      );
      assert.equal(
        await usdc.methods.balanceOf(governor).call(),
        bn(startGovernorUsdcBalance).add(bn(amount)).toString(),
        "Invalid end account balance"
      );
    });

    it("transferProductToken: should revert tx if sender not owner", async () => {
      const instance = await artifacts.require(
        "UsdcBuybackDepositaryBalanceView"
      );
      const [, notOwner] = artifacts.accounts;

      await assertions.reverts(
        instance.methods.transferProductToken(governor, "1").send({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });
  }
);
