const {migration} = require("../../../utils/deploy");

module.exports = migration("StableGovLPStaking", async (d) => {
  const [gov, stable, timelock] = await d.deployed(
    "GovernanceToken",
    "StableToken",
    "Timelock"
  );
  const blocksPerMinute = d.getNetwork().averageBlockTime;

  let StableGovLPAddress = await d.call("@UniswapV2Factory", "getPair", [
    stable.address,
    gov.address,
  ]);
  if (StableGovLPAddress === "0x0000000000000000000000000000000000000000") {
    const {
      events: {
        PairCreated: {
          returnValues: {pair},
        },
      },
    } = await d.send("@UniswapV2Factory", "createPair", [
      stable.address,
      gov.address,
    ]);
    StableGovLPAddress = pair;
  }

  await d.deploy("StableGovLPStaking", {
    contract: "Staking",
    args: [
      timelock.address,
      Math.floor(blocksPerMinute * 60 * 24 * 28), // 4 weeks
      gov.address,
      StableGovLPAddress,
      0,
      0,
    ],
  });
});
