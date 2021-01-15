const {migration} = require("../utils/deploy");

module.exports = migration("GovernanceToken", async (d) => {
  const governor = d.getGovernor().address;

  await d.deploy("GovernanceToken", {
    args: [governor],
  });
});
