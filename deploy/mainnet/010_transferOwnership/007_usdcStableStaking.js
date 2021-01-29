const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "UsdcStableLPLockStaking.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    const currentOwner = await d.call("UsdcStableLPLockStaking", "owner", []);
    if (currentOwner === timelock.address) {
      console.log(
        `UsdcStableLPLockStaking contract owner already transfered to timelock contract`
      );
      return;
    }

    await d.send("UsdcStableLPLockStaking", "transferOwnership", [
      timelock.address,
    ]);
  }
);
