const {migration} = require("../../utils/deploy");

module.exports = migration("RealAssetDepositaryBalanceView", async (d) => {
  const governor = d.getGovernor().address;
  await d.deploy("RealAssetDepositaryBalanceView", {
    args: [6, 50],
  });
  await d.send("RealAssetDepositaryBalanceView", "allowAccess", [governor])
});
