const {migration} = require("../../utils/deploy");

module.exports = migration("YieldEscrow", async (d) => {
  const [gov] = await d.deployed("GovernanceToken");

  await d.deploy("YieldEscrow", {
    args: [gov.address],
  });
  if (!d.isDev) {
    await d.toTimelock("YieldEscrow");
  }
});
