const {migration} = require("../../../utils/deploy");

module.exports = migration("Vesting.delegate", async (d) => {
  const governor = d.getGovernor().address;
  const [gov] = await d.deployed("GovernanceToken");
  await d.send("Vesting", "delegate", [gov.address, governor]);  // TODO change wallet for mainnet launch
});
