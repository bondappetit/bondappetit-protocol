const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../../utils/test");

contract(
  "BuybackDepositaryBalanceView.transferStableToken",
  ({web3, artifacts}) => {
    const network = artifacts.network;
    const governor = network.accounts.Governor.address;
    const donor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
    const {USDC} = network.assets;

    it("transferStableToken: should transfer stable token", async () => {
      const [
        instance,
        collateralMarket,
        stable,
        stableTokenDepositary,
      ] = await artifacts.requireAll(
        "UsdcBuybackDepositaryBalanceView",
        "CollateralMarket",
        "StableToken",
        "StableTokenDepositaryBalanceView"
      );
      const usdc = new web3.eth.Contract(
        network.contracts.Stable.abi,
        USDC.address
      );
      const amount = "100";

      await usdc.methods.transfer(governor, amount).send({from: donor});
      await usdc.methods
        .approve(collateralMarket._address, amount)
        .send({from: governor});
      await collateralMarket.methods
        .buy(USDC.address, amount)
        .send({from: governor, gas: 6000000});
      await stable.methods
        .transfer(instance._address, `${amount}${'0'.repeat(12)}`)
        .send({from: governor, gas: 6000000});

      await instance.methods
        .transferStableToken(governor, `${amount}${'0'.repeat(12)}`)
        .send({from: governor, gas: 6000000});

      assert.equal(
        await stable.methods.balanceOf(instance._address).call(),
        "0",
        "Invalid end depositary balance"
      );
      assert.equal(
        await stable.methods.balanceOf(governor).call(),
        `${amount}${'0'.repeat(12)}`,
        "Invalid end account balance"
      );
    });

    it("transferStableToken: should revert tx if sender not owner", async () => {
      const instance = await artifacts.require(
        "UsdcBuybackDepositaryBalanceView"
      );
      const [, notOwner] = artifacts.accounts;

      await assertions.reverts(
        instance.methods.transferStableToken(governor, "1").send({
          from: notOwner,
        }),
        "Ownable: caller is not the owner"
      );
    });
  }
);
