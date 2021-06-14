const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "RealAssetDepositaryBalanceView.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    const accessList = await d.call(
      "RealAssetDepositaryBalanceView",
      "accessList",
      []
    );
    if (accessList.includes(timelock.address)) {
      console.log(
        `RealAssetDepositaryBalanceView contract owner already transfered to timelock contract`
      );
      return;
    }

    await d.send("RealAssetDepositaryBalanceView", "allowAccess", [
      timelock.address,
    ]);
  }
);
