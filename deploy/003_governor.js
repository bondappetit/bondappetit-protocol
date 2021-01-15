const {migration} = require("../utils/deploy");

module.exports = migration("GovernorAlpha", async (d) => {
  const governor = d.getGovernor().address;

  const [timelock, gov] = await d.deployed("Timelock", "GovernanceToken");
  const governorAlpha = await d.deploy("GovernorAlpha", {
    args: [timelock.address, gov.address, governor],
  });

  await d.send("Timelock", "__transferAdmin", [governorAlpha.address]);
});
