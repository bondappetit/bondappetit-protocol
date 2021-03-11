const {migration} = require("../../../utils/deploy");

module.exports = migration("Investment.transferLock", async (d) => {
  const [investment] = await d.deployed("Investment");
  await d.send("GovernanceToken", "allowTransferLock", [investment.address]);
});
