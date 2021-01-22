const {migration} = require("../utils/deploy");

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
  const duration = blocksPerMinute * 60 * 24 * 28; // 4 weeks
  const rewardingTokens = [
    {
      name: "GovStaking",
      distributor: governor,
      reward: gov.address,
      staking: gov.address,
      duration,
    },
    {
      name: "StableStaking",
      distributor: governor,
      reward: gov.address,
      staking: stable.address,
      duration,
    },
    {
      name: "UsdcGovLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdcGovLPAddress,
      duration,
    },
    {
      name: "WethGovLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: WethGovLPAddress,
      duration,
    },
    {
      name: "UsdnGovLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdnGovLPAddress,
      duration,
    },
    {
      name: "UsdcStableLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdcStableLPAddress,
      duration,
    },
    {
      name: "UsdnStableLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdnStableLPAddress,
      duration,
    },
    {
      name: "GovStableLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: GovStableLPAddress,
      duration,
    },
  ];

  const {networkName} = d.getNetwork();
  const [timelock] = await d.deployed("Timelock");

  await rewardingTokens.reduce(
    async (tx, {name, distributor, reward, staking, duration}) => {
      await tx;
      await d.deploy(name, {
        contract: "Staking",
        args: [distributor, duration, reward, staking],
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
  await d.send("Issuer", "transferOwnership", [timelock.address]);
  await d.send("CollateralMarket", "transferOwnership", [timelock.address]);
  await d.send("Market", "transferOwnership", [timelock.address]);
});
