const {migration} = require("../../../utils/deploy");

module.exports = migration("UsdnGovLPStaking.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  await d.send("UsdnGovLPStaking", "transferOwnership", [timelock.address]);
});
