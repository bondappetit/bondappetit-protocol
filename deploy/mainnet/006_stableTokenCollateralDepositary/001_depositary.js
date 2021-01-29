const {migration} = require("../../../utils/deploy");

module.exports = migration("StableTokenDepositaryBalanceView", async (d) => {
  await d.deploy("StableTokenDepositaryBalanceView", {});
});
