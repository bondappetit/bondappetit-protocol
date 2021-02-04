const {migration} = require("../../../utils/deploy");

module.exports = migration("UsdcStableLPLockStaking", async (d) => {
  const {
    assets: {USDC},
  } = d.getNetwork();
  const [stable, gov, timelock] = await d.deployed("StableToken", "GovernanceToken", "Timelock");
  const currentBlock = await d.web3.eth.getBlockNumber();
  const blocksPerMinute = 4;

  let UsdcStableLPAddress = await d.call("@UniswapV2Factory", "getPair", [
    USDC.address,
    stable.address,
  ]);
  if (UsdcStableLPAddress === "0x0000000000000000000000000000000000000000") {
    const {
      events: {
        PairCreated: {
          returnValues: {pair},
        },
      },
    } = await d.send("@UniswapV2Factory", "createPair", [
      USDC.address,
      stable.address,
    ]);
    UsdcStableLPAddress = pair;
  }

  await d.deploy("UsdcStableLPLockStaking", {
    contract: "Staking",
    args: [
      timelock.address,
      blocksPerMinute * 60 * 24 * 180, // 6 months
      gov.address,
      UsdcStableLPAddress,
      Math.floor(
        currentBlock + (new Date("2021-04-01 03:00:00") - Date.now()) / 15000
      ),
      Math.floor(
        currentBlock + (new Date("2021-08-01 03:00:00") - Date.now()) / 15000
      ),
    ],
  });
});
