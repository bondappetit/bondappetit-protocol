const {migration} = require("../../../utils/deploy");

module.exports = migration("VestingSplitter", async (d) => {
  const governor = d.getGovernor().address;

  await d.deploy("VestingSplitter");
  await d.send("VestingSplitter", "transferOwnership", [governor]);
});
