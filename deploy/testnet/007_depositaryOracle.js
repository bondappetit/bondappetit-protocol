const {migration} = require("../../utils/deploy");

module.exports = migration("DepositaryOracle", async (d) => {
  await d.deploy("DepositaryOracle");
});
