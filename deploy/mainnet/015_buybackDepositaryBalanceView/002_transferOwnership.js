const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "BuybackDepositaryBalanceView.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    const currentOwner = await d.call(
      "BuybackDepositaryBalanceView",
      "owner",
      []
    );
    if (currentOwner === timelock.address) {
      console.log(
        `BuybackDepositaryBalanceView contract owner already transfered to timelock contract`
      );
      return;
    }

    await d.send("BuybackDepositaryBalanceView", "transferOwnership", [
      timelock.address,
    ]);
  }
);
