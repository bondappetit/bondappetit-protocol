const {migration, bn} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.transferToTreasury", async (d) => {
  const [treasury] = await d.deployed("Treasury");
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const amount = bn(govTotalSupply).div(bn(10000)).mul(bn(5902)).sub(bn('1823000000000000000000')).toString(); // 59.02% - audit

  await d.send("GovernanceToken", "transfer", [treasury.address, amount]);
});
