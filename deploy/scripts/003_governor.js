const {migration} = require("../utils");

module.exports = migration("GovernorAlpha", async (d) => {
  const governor = d.getGovernor().address;

  const [timelock, bond] = await d.deployed("Timelock", "Bond");
  const governorAlpha = await d.deploy("GovernorAlpha", {
    args: [timelock.address, bond.address, governor],
  });

  await d.send("Timelock", "__transferAdmin", [governorAlpha.address]);
});
