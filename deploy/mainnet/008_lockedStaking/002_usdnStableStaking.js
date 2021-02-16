const {migration} = require("../../../utils/deploy");

module.exports = migration("UsdnStableLPLockStaking", async (d) => {
  let {
    assets: {USDN},
  } = d.getNetwork();
  const [stable, gov, timelock] = await d.deployed("StableToken", "GovernanceToken", "Timelock");
  const currentBlock = await d.web3.eth.getBlockNumber();
  const blocksPerMinute = 4;

  if (!USDN) {
    await d.deploy("USDN", {
      contract: "MockERC20",
      args: ["Neutrino USD", "USDN", "1000000000000000000000000"],
    });
    [USDN] = await d.deployed("USDN");
  }

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
      blocksPerMinute * 60 * 24 * 180, // 6 months
      gov.address,
      UsdnStableLPAddress,
      Math.floor(
        currentBlock + (new Date("2021-04-01 03:00:00") - Date.now()) / 15000
      ),
      Math.floor(
        currentBlock + (new Date("2021-08-01 03:00:00") - Date.now()) / 15000
      ),
    ],
  });
});
