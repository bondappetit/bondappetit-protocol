const {migration} = require("../../../utils/deploy");

module.exports = migration("Vesting.delegate", async (d) => {
  const [gov] = await d.deployed("GovernanceToken");
  const recipient = '0xe4450697befFa0265226050e03eBe24B27Db735a';

  await d.send("Vesting", "delegate", [gov.address, recipient]);
});
