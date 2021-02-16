const {migration} = require("../../utils/deploy");

async function createUniswapPair(d, token0, token1) {
  const {
    events: {
      PairCreated: {
        returnValues: {pair},
      },
    },
  } = await d.send("@UniswapV2Factory", "createPair", [token0, token1]);

  return pair;
}

module.exports = migration("UsdcStableLPStaking", async (d) => {
  let {
    assets: {USDC, WETH, USDN},
  } = d.getNetwork();
  const governor = d.getGovernor().address;

  if (!USDN) {
    [USDN] = await d.deployed("USDN");
  }

  const currentBlock = await d.web3.eth.getBlockNumber();
  const [stable, gov] = await d.deployed("StableToken", "GovernanceToken");
  const UsdcGovLPAddress = await createUniswapPair(
    d,
    USDC.address,
    gov.address
  );
  const WethGovLPAddress = await createUniswapPair(
    d,
    WETH.address,
    gov.address
  );
  const UsdnGovLPAddress = await createUniswapPair(
    d,
    USDN.address,
    gov.address
  );
  const UsdcStableLPAddress = await createUniswapPair(
    d,
    USDC.address,
    stable.address
  );
  const UsdnStableLPAddress = await createUniswapPair(
    d,
    USDN.address,
    stable.address
  );
  const GovStableLPAddress = await createUniswapPair(
    d,
    gov.address,
    stable.address
  );

  const blocksPerMinute = 4;
  const weeks4Duration = blocksPerMinute * 60 * 24 * 28;
  const months6Duration = blocksPerMinute * 60 * 24 * 180;
  const rewardingTokens = [
    {
      name: "GovStaking",
      distributor: governor,
      reward: gov.address,
      staking: gov.address,
      duration: weeks4Duration,
      endStakingBlock: 0,
      startUnstakingBlock: 0,
    },
    {
      name: "StableStaking",
      distributor: governor,
      reward: gov.address,
      staking: stable.address,
      duration: weeks4Duration,
      endStakingBlock: 0,
      startUnstakingBlock: 0,
    },
    {
      name: "UsdcGovLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdcGovLPAddress,
      duration: weeks4Duration,
      endStakingBlock: 0,
      startUnstakingBlock: 0,
    },
    {
      name: "WethGovLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: WethGovLPAddress,
      duration: weeks4Duration,
      endStakingBlock: 0,
      startUnstakingBlock: 0,
    },
    {
      name: "UsdnGovLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdnGovLPAddress,
      duration: weeks4Duration,
      endStakingBlock: 0,
      startUnstakingBlock: 0,
    },
    {
      name: "UsdcStableLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdcStableLPAddress,
      duration: weeks4Duration,
      endStakingBlock: 0,
      startUnstakingBlock: 0,
    },
    {
      name: "UsdnStableLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdnStableLPAddress,
      duration: weeks4Duration,
      endStakingBlock: 0,
      startUnstakingBlock: 0,
    },
    {
      name: "GovStableLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: GovStableLPAddress,
      duration: weeks4Duration,
      endStakingBlock: 0,
      startUnstakingBlock: 0,
    },
    {
      name: "UsdcStableLPLockStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdcStableLPAddress,
      duration: months6Duration,
      endStakingBlock: Math.floor(
        currentBlock + (new Date("2021-04-01 00:00:00") - Date.now()) / 15000
      ),
      startUnstakingBlock: Math.floor(
        currentBlock + (new Date("2021-07-01 00:00:00") - Date.now()) / 15000
      ),
    },
    {
      name: "UsdnStableLPLockStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdnStableLPAddress,
      duration: months6Duration,
      endStakingBlock: Math.floor(
        currentBlock + (new Date("2021-04-01 00:00:00") - Date.now()) / 15000
      ),
      startUnstakingBlock: Math.floor(
        currentBlock + (new Date("2021-07-01 00:00:00") - Date.now()) / 15000
      ),
    },
  ];

  const {networkName} = d.getNetwork();
  const [timelock] = await d.deployed("Timelock");

  await rewardingTokens.reduce(
    async (
      tx,
      {
        name,
        distributor,
        reward,
        staking,
        duration,
        endStakingBlock,
        startUnstakingBlock,
      }
    ) => {
      await tx;
      await d.deploy(name, {
        contract: "Staking",
        args: [
          distributor,
          duration,
          reward,
          staking,
          endStakingBlock,
          startUnstakingBlock,
        ],
      });
      if (networkName === "development") return;
      await d.send(name, "transferOwnership", [timelock.address]);
    },
    Promise.resolve()
  );

  if (networkName === "development") return;
  await d.send("GovernanceToken", "transferOwnership", [timelock.address]);
  await d.send("Investment", "transferOwnership", [timelock.address]);
  await d.send("Vesting", "transferOwnership", [timelock.address]);
  await d.send("Treasury", "transferOwnership", [timelock.address]);
  await d.send("StableTokenDepositaryBalanceView", "transferOwnership", [
    timelock.address,
  ]);
  await d.send("RealAssetDepositaryBalanceView", "transferOwnership", [
    timelock.address,
  ]);
  await d.send("Issuer", "transferOwnership", [timelock.address]);
  await d.send("CollateralMarket", "transferOwnership", [timelock.address]);
  await d.send("Market", "transferOwnership", [timelock.address]);
});
