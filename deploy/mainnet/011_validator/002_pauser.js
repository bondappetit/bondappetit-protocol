const {migration} = require("../../../utils/deploy");

module.exports = migration("ProtocolValidator.pauser", async (d) => {
  await d.toValidator(
    "Investment",
    "Vesting",
    "Issuer",
    "CollateralMarket",
    "UsdcStableLPLockStaking",
    "UsdnStableLPLockStaking",
    "UsdcGovLPStaking",
    "UsdnGovLPStaking"
  );
});
