const {migration, bn} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.transferToTreasury", async (d) => {
  const [treasury] = await d.deployed("Treasury");
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const amount = bn(govTotalSupply).div(bn(10000)).mul(bn(5902)).toString(); // 59.02%

  await d.send("GovernanceToken", "transfer", [treasury.address, amount]);
});
