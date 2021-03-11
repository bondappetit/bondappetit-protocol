const {migration} = require("../../../utils/deploy");

module.exports = migration("Investment.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  const currentOwner = await d.call("Investment", "owner", []);
  if (currentOwner === timelock.address) {
    console.log(`Investment owner already transfered to timelock contract`);
    return;
  }

  await d.send("Investment", "transferOwnership", [timelock.address]);
});
