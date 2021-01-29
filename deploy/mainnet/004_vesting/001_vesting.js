const {migration} = require("../../../utils/deploy");

module.exports = migration("Vesting", async (d) => {
  const [gov] = await d.deployed("GovernanceToken");
  await d.deploy("Vesting", {
    args: [gov.address],
  });
});
