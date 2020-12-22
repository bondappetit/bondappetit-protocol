const {migration} = require("../utils");

module.exports = migration("SecurityOracle", async (d) => {
  await d.deploy("SecurityOracle");
});
