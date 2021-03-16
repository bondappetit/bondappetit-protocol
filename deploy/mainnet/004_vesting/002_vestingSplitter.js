const {migration} = require("../../../utils/deploy");

module.exports = migration("VestingSplitter", async (d) => {
  const governor = d.getGovernor().address;
  const [vesting] = await d.deployed("Vesting");

  await d.deploy("VestingSplitter", {
    args: [vesting.address],
  });
  await d.send("VestingSplitter", "transferOwnership", [governor]);
});
