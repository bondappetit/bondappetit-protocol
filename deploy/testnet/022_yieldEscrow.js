const {migration} = require("../../utils/deploy");

module.exports = migration("YieldEscrow", async (d) => {
  const [gov] = await d.deployed("GovernanceToken");

  await d.deploy("VoteDelegator");
  const [voteDelegatorPrototype] = await d.deployed("VoteDelegator");

  await d.deploy("YieldEscrow", {
    args: [gov.address, voteDelegatorPrototype.address],
  });
});
