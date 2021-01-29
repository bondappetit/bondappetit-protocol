const {migration} = require("../../../utils/deploy");

module.exports = migration("Timelock", async (d) => {
  const governor = d.getGovernor().address;

  const safeMath = await d.deploy("SafeMath");

  await d.deploy("Timelock", {
    args: [
      governor,
      2 * 24 * 60 * 60, // 2 days delay
    ],
    libraries: {
      SafeMath: safeMath.address,
    },
  });
});
