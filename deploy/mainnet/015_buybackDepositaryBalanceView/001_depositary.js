const {migration} = require("../../../utils/deploy");

module.exports = migration("BuybackDepositaryBalanceView", async (d) => {
  const {
    assets: {USDC},
  } = d.getNetwork();
  const [issuer] = await d.deployed("Issuer");

  await d.deploy("BuybackDepositaryBalanceView", {
    args: [issuer.address, USDC.address],
  });
});
