const {migration} = require("../../../utils/deploy");

module.exports = migration("UsdnStableLPLockStaking", async (d) => {
  const {
    assets: {USDN},
  } = d.getNetwork();
  const [stable, gov, timelock] = await d.deployed("StableToken", "GovernanceToken", "Timelock");
  const currentBlock = await d.web3.eth.getBlockNumber();
  const blocksPerMinute = 4;

  let UsdnStableLPAddress = await d.call("@UniswapV2Factory", "getPair", [
    USDN.address,
    stable.address,
  ]);
  if (UsdnStableLPAddress === "0x0000000000000000000000000000000000000000") {
    const {
      events: {
        PairCreated: {
          returnValues: {pair},
        },
      },
    } = await d.send("@UniswapV2Factory", "createPair", [
      USDN.address,
      stable.address,
    ]);
    UsdnStableLPAddress = pair;
  }

  await d.deploy("UsdnStableLPLockStaking", {
    contract: "Staking",
    args: [
      timelock.address,
      blocksPerMinute * 60 * 24 * 90, // 3 months
      gov.address,
      UsdnStableLPAddress,
      Math.floor(
        currentBlock + (new Date("2021-04-16 03:00:00") - Date.now()) / 15000
      ),
      Math.floor(
        currentBlock + (new Date("2021-06-16 03:00:00") - Date.now()) / 15000
      ),
    ],
  });
});
