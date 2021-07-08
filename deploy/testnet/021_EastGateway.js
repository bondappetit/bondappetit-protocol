const {migration} = require("../../utils/deploy");

module.exports = migration("EastGateway", async (d) => {
  const [market] = await d.deployed("Market");

  await d.deploy("EastGateway", {
    args: [market.address, d.getGovernor().address],
  });
});
