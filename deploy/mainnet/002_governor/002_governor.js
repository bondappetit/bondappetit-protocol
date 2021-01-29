const {migration} = require("../../../utils/deploy");

module.exports = migration("GovernorAlpha", async (d) => {
  const [timelock, gov] = await d.deployed("Timelock", "GovernanceToken");
  const governorAlpha = await d.deploy("GovernorAlpha", {
    args: [timelock.address, gov.address, '0x0000000000000000000000000000000000000000'],
  });

  await d.send("Timelock", "__transferAdmin", [governorAlpha.address]);
});
