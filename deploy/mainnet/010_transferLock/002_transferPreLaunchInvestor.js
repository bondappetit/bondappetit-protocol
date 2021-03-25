const {migration, bn} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.transferPreLaunchInvestor", async (d) => {
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const [, recipient] = await d.web3.eth.getAccounts();
  const amount = bn(govTotalSupply).div(bn(100)).toString(); // 1%

  await d.send("GovernanceToken", "transfer", [recipient, amount]); // TODO change wallet for mainnet launch
});
