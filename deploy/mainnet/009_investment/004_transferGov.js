const {migration, bn} = require("../../../utils/deploy");

module.exports = migration("Investment.transferLock", async (d) => {
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const amount = bn(govTotalSupply).div(bn(10000)).mul(bn(48)).toString(); // 0.48%

  const [investment] = await d.deployed("Investment");
  await d.send("GovernanceToken", "transfer", [investment.address, amount]);
});
