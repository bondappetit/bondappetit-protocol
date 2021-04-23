const {migration} = require("../../../utils/deploy");

module.exports = migration("BnbGovLPStaking", async (d) => {
  const {
    assets: {bBAG, bBagBnbLP},
    averageBlockTime,
  } = d.getNetwork();
  const governor = d.getGovernor();
  const blocksPerMinute = 60 / averageBlockTime;

  await d.deploy("BnbGovLPStaking", {
    contract: "Staking",
    args: [
      governor.address,
      Math.floor(blocksPerMinute * 60 * 591), // 24.62 days
      bBAG.address,
      bBagBnbLP.address,
      0,
      0,
    ],
  });
});
