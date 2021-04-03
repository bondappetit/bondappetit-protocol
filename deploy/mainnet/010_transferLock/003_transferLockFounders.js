const {migration, bn} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.transferLockFounders", async (d) => {
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const currentBlock = await d.web3.eth.getBlockNumber();
  const recipient = '0x8b78Df1b5794aa7619f8beD70C82dFC702d04C61';
  const amount = bn(govTotalSupply).div(bn(100)).mul(bn(14)).toString(); // 14%
  const date = Math.floor(
    currentBlock + (new Date("2022-10-01 03:00:00") - Date.now()) / 15000
  );

  await d.send("GovernanceToken", "transferLock", [recipient, amount, date]);
});
