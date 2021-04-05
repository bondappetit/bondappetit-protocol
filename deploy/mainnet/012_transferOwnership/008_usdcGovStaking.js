const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "UsdcGovLPStaking.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    const currentOwner = await d.call("UsdcGovLPStaking", "owner", []);
    if (currentOwner === timelock.address) {
      console.log(
        `UsdcGovLPStaking contract owner already transfered to timelock contract`
      );
      return;
    }

    await d.send("UsdcGovLPStaking", "transferOwnership", [
      timelock.address,
    ]);
  }
);
