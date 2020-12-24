const {migration} = require("../utils/deploy");

module.exports = migration("ABT", async (d) => {
  await d.deploy("ABT", {
    args: [0],
  });
});
