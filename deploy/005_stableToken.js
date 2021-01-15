const {migration} = require("../utils/deploy");

module.exports = migration("StableToken", async (d) => {
  await d.deploy("StableToken", {
    args: [0],
  });
});
