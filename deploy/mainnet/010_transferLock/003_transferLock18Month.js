const {migration, bn} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.transferLock18Month", async (d) => {
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const currentBlock = await d.web3.eth.getBlockNumber();
  const [, , recipient] = await d.web3.eth.getAccounts();
  const amount = bn(govTotalSupply).div(bn(100)).mul(bn(14)).toString(); // 14%
  const date = Math.floor(
    currentBlock + (new Date("2022-09-16 03:00:00") - Date.now()) / 15000
  );

  await d.send("GovernanceToken", "transferLock", [recipient, amount, date]);
});
