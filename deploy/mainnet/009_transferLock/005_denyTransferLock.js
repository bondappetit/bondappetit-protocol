const {migration} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.denyTransferLock", async (d) => {
  const governor = d.getGovernor().address;
  await d.send("GovernanceToken", "denyTransferLock", [governor]);
});
