const {migration} = require("../../utils/deploy");

module.exports = migration("Treasury", async (d) => {
  await d.deploy("Treasury");
});
