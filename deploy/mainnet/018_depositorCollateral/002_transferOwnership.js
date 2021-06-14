const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "DepositorCollateral.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    const currentOwner = await d.call("DepositorCollateral", "owner", []);
    if (currentOwner === timelock.address) {
      console.log(
        `DepositorCollateral contract owner already transfered to timelock contract`
      );
      return;
    }

    await d.send("DepositorCollateral", "transferOwnership", [
      timelock.address,
    ]);
  }
);
