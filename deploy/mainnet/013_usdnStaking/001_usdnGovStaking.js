const {migration} = require("../../../utils/deploy");

module.exports = migration("UsdnGovLPStaking", async (d) => {
  const {
    assets: {USDN},
  } = d.getNetwork();
  const [gov, timelock] = await d.deployed("GovernanceToken", "Timelock");
  const blocksPerMinute = 4;

  let UsdnGovLPAddress = await d.call("@UniswapV2Factory", "getPair", [
    USDN.address,
    gov.address,
  ]);
  if (UsdnGovLPAddress === "0x0000000000000000000000000000000000000000") {
    const {
      events: {
        PairCreated: {
          returnValues: {pair},
        },
      },
    } = await d.send("@UniswapV2Factory", "createPair", [
      USDN.address,
      gov.address,
    ]);
    UsdnGovLPAddress = pair;
  }

  await d.deploy("UsdnGovLPStaking", {
    contract: "Staking",
    args: [
      timelock.address,
      Math.floor(blocksPerMinute * 60 * 24 * 28), // 4 weeks
      gov.address,
      UsdnGovLPAddress,
      0,
      0,
    ],
  });
});
