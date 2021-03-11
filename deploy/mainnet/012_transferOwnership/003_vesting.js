const {migration} = require("../../../utils/deploy");

module.exports = migration("Vesting.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  const currentOwner = await d.call("Vesting", "owner", []);
  if (currentOwner === timelock.address) {
    console.log(
      `Vesting contract owner already transfered to timelock contract`
    );
    return;
  }

  await d.send("Vesting", "transferOwnership", [timelock.address]);
});
