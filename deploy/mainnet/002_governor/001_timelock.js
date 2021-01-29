const {migration} = require("../../../utils/deploy");

module.exports = migration("Timelock", async (d) => {
  const governor = d.getGovernor().address;

  const safeMath = await d.deploy("SafeMath");

  await d.deploy("Timelock", {
    args: [
      governor,
      0
    ],
    libraries: {
      SafeMath: safeMath.address,
    },
  });
});
