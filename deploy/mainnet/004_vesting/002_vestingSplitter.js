const {migration} = require("../../../utils/deploy");

module.exports = migration("VestingSplitter", async (d) => {
  const recipient = '0xe4450697befFa0265226050e03eBe24B27Db735a';
  const [vesting] = await d.deployed("Vesting");

  await d.deploy("VestingSplitter", {
    args: [vesting.address],
  });
  await d.send("VestingSplitter", "transferOwnership", [recipient]);
});
