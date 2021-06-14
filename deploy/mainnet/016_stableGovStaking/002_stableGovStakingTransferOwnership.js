const {migration} = require("../../../utils/deploy");

module.exports = migration("StableGovLPStaking.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  await d.send("StableGovLPStaking", "transferOwnership", [timelock.address]);
});
