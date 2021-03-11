const {migration} = require("../../../utils/deploy");

module.exports = migration(
  "UsdnGovLPStaking.transferOwnership",
  async (d) => {
    const [timelock] = await d.deployed("Timelock");

    const currentOwner = await d.call("UsdnGovLPStaking", "owner", []);
    if (currentOwner === timelock.address) {
      console.log(
        `UsdnGovLPStaking contract owner already transfered to timelock contract`
      );
      return;
    }

    await d.send("UsdnGovLPStaking", "transferOwnership", [
      timelock.address,
    ]);
  }
);
