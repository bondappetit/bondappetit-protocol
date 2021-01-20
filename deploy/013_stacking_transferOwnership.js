const {migration} = require("../utils/deploy");

module.exports = migration("Staking", async (d) => {
  const {
    assets: {USDC, WETH},
  } = d.getNetwork();
  const governor = d.getGovernor().address;
  const [stable, gov] = await d.deployed("StableToken", "GovernanceToken");
  const [uniswapFactory] = await d.contract("UniswapV2Factory");
  const blocksPerMinute = 4;
  const [
    {
      events: {
        PairCreated: {
          returnValues: {pair: UsdcGovLPAddress},
        },
      },
    },
    {
      events: {
        PairCreated: {
          returnValues: {pair: WethGovLPAddress},
        },
      },
    },
    {
      events: {
        PairCreated: {
          returnValues: {pair: UsdcStableLPAddress},
        },
      },
    },
    {
      events: {
        PairCreated: {
          returnValues: {pair: GovStableLPAddress},
        },
      },
    },
  ] = await Promise.all([
    uniswapFactory.methods
      .createPair(USDC.address, gov.address)
      .send(d.getSendOptions()),
    uniswapFactory.methods
      .createPair(WETH.address, gov.address)
      .send(d.getSendOptions()),
    uniswapFactory.methods
      .createPair(USDC.address, stable.address)
      .send(d.getSendOptions()),
    uniswapFactory.methods
      .createPair(gov.address, stable.address)
      .send(d.getSendOptions()),
  ]);
  const rewardingTokens = [
    {
      name: "GovStaking",
      distributor: governor,
      reward: gov.address,
      staking: gov.address,
      duration: blocksPerMinute * 60 * 24 * 60, // 2 months
    },
    {
      name: "StableStaking",
      distributor: governor,
      reward: gov.address,
      staking: stable.address,
      duration: blocksPerMinute * 60 * 24 * 60, // 2 months
    },
    {
      name: "UsdcGovLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdcGovLPAddress,
      duration: blocksPerMinute * 60 * 24 * 60, // 2 months
    },
    {
      name: "WethGovLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: WethGovLPAddress,
      duration: blocksPerMinute * 60 * 24 * 60, // 2 months
    },
    {
      name: "UsdcStableLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: UsdcStableLPAddress,
      duration: blocksPerMinute * 60 * 24 * 60, // 2 months
    },
    {
      name: "GovStableLPStaking",
      distributor: governor,
      reward: gov.address,
      staking: GovStableLPAddress,
      duration: blocksPerMinute * 60 * 24 * 60, // 2 months
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
  await d.send("CollateralAddress", "transferOwnership", [timelock.address]);
  await d.send("Market", "transferOwnership", [timelock.address]);
});
