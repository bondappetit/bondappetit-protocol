const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "RealAssetDepositaryBalanceView.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    await d.send("RealAssetDepositaryBalanceView", "allowAccess", [
      timelock.address,
    ]);
  }
);
