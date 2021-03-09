const {migration} = require("../../../utils/deploy");

module.exports = migration("ProtocolValidator.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  const currentOwner = await d.call("ProtocolValidator", "owner", []);
  if (currentOwner === timelock.address) {
    console.log(`ProtocolValidator owner already transfered to timelock contract`);
    return;
  }

  await d.send("ProtocolValidator", "transferOwnership", [timelock.address]);
});
