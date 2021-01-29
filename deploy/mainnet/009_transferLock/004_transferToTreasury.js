const {migration, bn} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.transferToTreasury", async (d) => {
  const [treasury] = await d.deployed("Treasury");
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const amount = bn(govTotalSupply).div(bn(100)).mul(bn(55)).toString(); // 55%

  await d.send("GovernanceToken", "transfer", [treasury.address, amount]);
});
