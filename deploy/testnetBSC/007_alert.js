const {migration} = require("../../utils/deploy");
const {utils} = require("web3");

module.exports = migration("ProtocolValidator", async (d) => {
  const [stable, issuer, depositary] = await d.deployed(
    "StableToken",
    "Issuer",
    "RealAssetDepositaryBalanceView"
  );
  const blocksPerMinute = 4;

  const collateralBalanceValidator = await d.deploy(
    "CollateralBalanceValidator",
    {
      args: [stable.address, issuer.address, 20],
    }
  );
  const depositaryUpdateValidator = await d.deploy(
    "DepositaryUpdateValidator",
    {
      args: [depositary.address, blocksPerMinute * 60 * 24 * 3], // 3 day
    }
  );
  await d.deploy("ProtocolValidator", {
    args: [50],
  });
  const allProtocolContracts = "0x0000000000000000000000000000000000000000";
  await d.send("ProtocolValidator", "addValidator", [
    collateralBalanceValidator.address,
    allProtocolContracts,
  ]);
  await d.send("ProtocolValidator", "addValidator", [
    depositaryUpdateValidator.address,
    allProtocolContracts,
  ]);

  if (!d.isDev) {
    await d.toTimelock(
      "CollateralBalanceValidator",
      "DepositaryUpdateValidator"
    );
  }
});
