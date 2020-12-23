const {migration} = require("../utils");

module.exports = migration("Budget", async (d) => {
  //const [bond] = await d.deployed("Bond");
  const expenditures = [
    //{address: bond.address, min: "0", target: "0"}
  ];

  await d.deploy("Budget");
  await expenditures.reduce(async (tx, {address, min, target}) => {
    await tx;
    await d.send("Budget", "changeExpenditure", [address, min, target]);
  }, Promise.resolve());
});
