const {migration} = require("../../utils/deploy");
const {utils} = require("web3");

module.exports = migration("UsdcBuybackDepositaryBalanceView", async (d) => {
  const {
    assets: {USDC},
  } = d.getNetwork();
  const [issuer] = await d.deployed("Issuer");

  await d.deploy("UsdcBuybackDepositaryBalanceView", {
    contract: "BuybackDepositaryBalanceView",
    args: [issuer.address, USDC.address],
  });
  const [depositary] = await d.deployed("UsdcBuybackDepositaryBalanceView");

  if (!d.isDev) {
    await d.toTimelock("BuybackDepositaryBalanceView");
  } else {
    await d.send("Issuer", "addDepositary", [depositary.address]);
  }
});
