const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "UsdnStableLPLockStaking.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    const currentOwner = await d.call("UsdnStableLPLockStaking", "owner", []);
    if (currentOwner === timelock.address) {
      console.log(
        `UsdnStableLPLockStaking contract owner already transfered to timelock contract`
      );
      return;
    }

    await d.send("UsdnStableLPLockStaking", "transferOwnership", [
      timelock.address,
    ]);
  }
);
