const {migration} = require("../utils");

module.exports = migration("Bond", async (d) => {
  const governor = d.getGovernor().address;

  await d.deploy("Bond", {
    args: [governor],
  });
});
