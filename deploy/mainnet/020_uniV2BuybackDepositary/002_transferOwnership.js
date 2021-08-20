const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "UniV2BuybackDepositaryBalanceView.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    const currentOwner = await d.call(
      "UniV2BuybackDepositaryBalanceView",
      "owner",
      []
    );
    if (currentOwner === timelock.address) {
      console.log(
        `UniV2BuybackDepositaryBalanceView contract owner already transfered to timelock contract`
      );
      return;
    }

    await d.send("UniV2BuybackDepositaryBalanceView", "transferOwnership", [
      timelock.address,
    ]);
  }
);
