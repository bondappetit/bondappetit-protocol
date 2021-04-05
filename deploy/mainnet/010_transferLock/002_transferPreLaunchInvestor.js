const {migration, bn} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.transferPreLaunchInvestor", async (d) => {
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const recipient = '0x04c1bb6701D8b2f6e8aEf6fd1FAc45cC443bF1B7';
  const amount = bn(govTotalSupply).div(bn(100)).toString(); // 1%

  await d.send("GovernanceToken", "transfer", [recipient, amount]);
});
