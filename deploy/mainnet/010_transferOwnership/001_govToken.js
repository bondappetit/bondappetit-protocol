const {migration} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  const currentOwner = await d.call("GovernanceToken", "owner", []);
  if (currentOwner === timelock.address) {
    console.log(
      `Governance token owner already transfered to timelock contract`
    );
    return;
  }

  await d.send("GovernanceToken", "transferOwnership", [timelock.address]);
});
