const {migration} = require("../utils");

module.exports = migration("ABT", async (d) => {
  await d.deploy("ABT", {
    args: [0],
  });
});
