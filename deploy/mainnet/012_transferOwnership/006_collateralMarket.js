const {migration} = require("../../../utils/deploy");

module.exports = migration("CollateralMarket.transferOwnership", async (d) => {
  const [timelock] = await d.deployed("Timelock");

  const currentOwner = await d.call("CollateralMarket", "owner", []);
  if (currentOwner === timelock.address) {
    console.log(
      `CollateralMarket contract owner already transfered to timelock contract`
    );
    return;
  }

  await d.send("CollateralMarket", "transferOwnership", [timelock.address]);
});
