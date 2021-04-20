const {migration} = require("../../utils/deploy");

module.exports = migration("Budget", async (d) => {
  //const [gov] = await d.deployed("GovernanceToken");
  const expenditures = [
    //{address: gov.address, min: "0", target: "0"}
  ];

  await d.deploy("Budget");
  await expenditures.reduce(async (tx, {address, min, target}) => {
    await tx;
    await d.send("Budget", "changeExpenditure", [address, min, target]);
  }, Promise.resolve());
});
