const {migration} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.allowTransferLock", async (d) => {
  const governor = d.getGovernor().address;
  await d.send("GovernanceToken", "allowTransferLock", [governor]);
});
