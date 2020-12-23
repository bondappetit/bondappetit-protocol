const {migration} = require("../utils");

module.exports = migration("DepositaryOracle", async (d) => {
  await d.deploy("DepositaryOracle");
});
