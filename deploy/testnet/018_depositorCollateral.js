const {migration} = require("../../utils/deploy");
const {utils} = require("web3");

module.exports = migration("DepositorCollateral", async (d) => {
  await d.deploy("DepositorCollateral", {
    args: [50],
  });

  const {networkName} = d.getNetwork();
  if (networkName === "development") return;

  const [timelock] = await d.deployed("Timelock");
  await d.send("DepositorCollateral", "transferOwnership", [timelock.address]);
});