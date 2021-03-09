const {migration} = require("../../utils/deploy");
const {utils} = require("web3");

module.exports = migration("DepositorCollateral", async (d) => {
  await d.deploy("DepositorCollateral", {
    args: [50],
  });

  if (!d.isDev) {
    await d.toTimelock("DepositorCollateral");
  }
});
