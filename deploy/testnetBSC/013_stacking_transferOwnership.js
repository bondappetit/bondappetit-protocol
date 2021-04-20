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
    assets: {USDC},
  } = d.getNetwork();
  const governor = d.getGovernor().address;

  const currentBlock = await d.web3.eth.getBlockNumber();
  const [stable, gov] = await d.deployed("StableToken", "GovernanceToken");
  const UsdcGovLPAddress = await createUniswapPair(
    d,
    USDC.address,
    gov.address
  );
  const UsdcStableLPAddress = await createUniswapPair(
    d,
    USDC.address,
    stable.address
  );

  const blocksPerMinute = 4;
  const weeks4Duration = blocksPerMinute * 60 * 24 * 28;
  const months6Duration = blocksPerMinute * 60 * 24 * 180;
  const rewardingTokens = [
    {
      name: "UsdcGovLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdcGovLPAddress,
      duration: weeks4Duration,
      endStakingBlock: 0,
      startUnstakingBlock: 0,
      amount: `500000${"0".repeat(18)}`,
    },
    {
      name: "UsdcStableLPLockStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdcStableLPAddress,
      duration: months6Duration,
      endStakingBlock: Math.floor(
        currentBlock + (new Date("2021-06-01 00:00:00") - Date.now()) / 15000
      ),
      startUnstakingBlock: Math.floor(
        currentBlock + (new Date("2021-07-01 00:00:00") - Date.now()) / 15000
      ),
      amount: `1000000${"0".repeat(18)}`,
    },
  ];

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
        amount,
      }
    ) => {
      await tx;
      const {address} = await d.deploy(name, {
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
      await d.send("GovernanceToken", "transfer", [address, amount]);
      await d.send(name, "notifyRewardAmount", [amount]);
    },
    Promise.resolve()
  );

  await d.toValidator(
    "Investment",
    "Vesting",
    "Issuer",
    "CollateralMarket",
    "Market",
    ...rewardingTokens.map(({name}) => name)
  );
  if (!d.isDev) {
    await d.toTimelock(
      "GovernanceToken",
      "Investment",
      "Vesting",
      "Treasury",
      "StableTokenDepositaryBalanceView",
      "RealAssetDepositaryBalanceView",
      "Issuer",
      "CollateralMarket",
      "Market",
      ...rewardingTokens.map(({name}) => name)
    );
  }
});
