const {migration} = require("../utils/deploy");

module.exports = migration("SecurityOracle", async (d) => {
  await d.deploy("SecurityOracle");
});
