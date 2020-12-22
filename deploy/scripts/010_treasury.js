const {migration} = require("../utils");

module.exports = migration("Treasury", async (d) => {
  await d.deploy("Treasury");
});
