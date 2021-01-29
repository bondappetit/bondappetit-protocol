const {migration} = require("../../../utils/deploy");

module.exports = migration("CollateralMarket.treasuryAllowAccess", async (d) => {
  const currentAccessSet = new Set(await d.call("Treasury", "accessList", []));

  const [collateralMarket] = await d.deployed("CollateralMarket");
  if (currentAccessSet.has(collateralMarket.address)) {
    console.log("Access collateral market to treasury already allowed");
    return;
  }

  await d.send("Treasury", "allowAccess", [collateralMarket.address]);
});
