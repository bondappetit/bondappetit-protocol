const {migration} = require("../../../utils/deploy");

module.exports = migration("Issuer.addDepositary", async (d) => {
  const [stableTokenDepositaryBalanceView] = await d.deployed(
    "StableTokenDepositaryBalanceView"
  );
  const allowedDepositaries = [stableTokenDepositaryBalanceView.address];

  const currentDepositariesSet = new Set(
    await d.call("Issuer", "allowedDepositaries", [])
  );

  await allowedDepositaries.reduce(async (p, depositary) => {
    await p;

    if (currentDepositariesSet.has(depositary)) {
      console.log(`Depositary "${depositary}" already allowed`);
      return Promise.resolve();
    }

    await d.send("Issuer", "addDepositary", [depositary]);
  }, Promise.resolve());
});
