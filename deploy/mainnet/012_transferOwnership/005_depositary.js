const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "StableTokenDepositaryBalanceView.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    const currentOwner = await d.call(
      "StableTokenDepositaryBalanceView",
      "owner",
      []
    );
    if (currentOwner === timelock.address) {
      console.log(
        `StableTokenDepositaryBalanceView contract owner already transfered to timelock contract`
      );
      return;
    }

    await d.send("StableTokenDepositaryBalanceView", "transferOwnership", [
      timelock.address,
    ]);
  }
);
