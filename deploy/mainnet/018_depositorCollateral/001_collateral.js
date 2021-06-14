const {migration} = require("../../../utils/deploy");

module.exports = migration("DepositorCollateral", async (d) => {
  await d.deploy("DepositorCollateral", {
    args: [50],
  });
});
