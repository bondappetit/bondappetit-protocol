const {migration} = require("../../../utils/deploy");

module.exports = migration("Issuer.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  const currentOwner = await d.call("Issuer", "owner", []);
  if (currentOwner === timelock.address) {
    console.log(
      `Issuer contract owner already transfered to timelock contract`
    );
    return;
  }

  await d.send("Issuer", "transferOwnership", [timelock.address]);
});
