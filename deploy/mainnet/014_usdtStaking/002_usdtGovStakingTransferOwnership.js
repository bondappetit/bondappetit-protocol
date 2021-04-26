const {migration} = require("../../../utils/deploy");

module.exports = migration("UsdtGovLPStaking.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  await d.send("UsdtGovLPStaking", "transferOwnership", [timelock.address]);
});
