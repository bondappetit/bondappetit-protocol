const {migration} = require("../../../utils/deploy");

module.exports = migration("Market.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  const currentOwner = await d.call("Market", "owner", []);
  if (currentOwner === timelock.address) {
    console.log(
      `Market contract owner already transfered to timelock contract`
    );
    return;
  }

  await d.send("Market", "transferOwnership", [timelock.address]);
});
