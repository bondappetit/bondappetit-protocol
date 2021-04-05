const {migration} = require("../../../utils/deploy");

module.exports = migration("UsdcGovLPStaking", async (d) => {
  const {
    assets: {USDC},
  } = d.getNetwork();
  const [gov, timelock] = await d.deployed("GovernanceToken", "Timelock");
  const blocksPerMinute = 4;

  let UsdcGovLPAddress = await d.call("@UniswapV2Factory", "getPair", [
    USDC.address,
    gov.address,
  ]);
  if (UsdcGovLPAddress === "0x0000000000000000000000000000000000000000") {
    const {
      events: {
        PairCreated: {
          returnValues: {pair},
        },
      },
    } = await d.send("@UniswapV2Factory", "createPair", [
      USDC.address,
      gov.address,
    ]);
    UsdcGovLPAddress = pair;
  }

  await d.deploy("UsdcGovLPStaking", {
    contract: "Staking",
    args: [
      timelock.address,
      blocksPerMinute * 60 * 24 * 28, // 4 weeks
      gov.address,
      UsdcGovLPAddress,
      0,
      0,
    ],
  });
});
