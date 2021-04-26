const {migration} = require("../../../utils/deploy");

module.exports = migration("UsdtGovLPStaking", async (d) => {
  const {
    assets: {USDT},
  } = d.getNetwork();
  const [gov, timelock] = await d.deployed("GovernanceToken", "Timelock");
  const blocksPerMinute = 4;

  let UsdtGovLPAddress = await d.call("@UniswapV2Factory", "getPair", [
    USDT.address,
    gov.address,
  ]);
  if (UsdtGovLPAddress === "0x0000000000000000000000000000000000000000") {
    const {
      events: {
        PairCreated: {
          returnValues: {pair},
        },
      },
    } = await d.send("@UniswapV2Factory", "createPair", [
      USDT.address,
      gov.address,
    ]);
    UsdtGovLPAddress = pair;
  }

  await d.deploy("UsdtGovLPStaking", {
    contract: "Staking",
    args: [
      timelock.address,
      Math.floor(blocksPerMinute * 60 * 24 * 28), // 4 weeks
      gov.address,
      UsdtGovLPAddress,
      0,
      0,
    ],
  });
});
