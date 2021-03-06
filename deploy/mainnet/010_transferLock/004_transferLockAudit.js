const {migration} = require("../../../utils/deploy");

module.exports = migration("GovernanceToken.transferLockAudit", async (d) => {
  const currentBlock = await d.web3.eth.getBlockNumber();
  const recipient = '0xc8d968165cd47b90cf390626017d6d69ca242a0f';
  const amount = '1823000000000000000000';
  const date = Math.floor(
    currentBlock + (new Date("2021-07-03 18:00:00") - Date.now()) / 15000
  );

  await d.send("GovernanceToken", "transferLock", [recipient, amount, date]);
});
