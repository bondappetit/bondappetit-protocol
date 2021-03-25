const {migration} = require("../../utils/deploy");
const {utils} = require("web3");

module.exports = migration("CompoundDepositaryBalanceView", async (d) => {
  await d.deploy("CompoundDepositaryBalanceView", {});

  if (!d.isDev) {
    await d.toTimelock("CompoundDepositaryBalanceView");
  }
});
