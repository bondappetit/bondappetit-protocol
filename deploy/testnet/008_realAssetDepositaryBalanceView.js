const {migration} = require("../../utils/deploy");

module.exports = migration("RealAssetDepositaryBalanceView", async (d) => {
  await d.deploy("RealAssetDepositaryBalanceView", {
    args: [6, 50],
  });
});
