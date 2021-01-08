const {migration} = require("../utils/deploy");

module.exports = migration("Staking", async (d) => {
  const governor = d.getGovernor().address;
  const [abt, bond] = await d.deployed("ABT", "Bond");
  const blocksPerMinute = 4;
  const rewardingTokens = [
    {
      name: "GovStaking",
      distributor: governor,
      reward: bond.address,
      staking: bond.address,
      duration: blocksPerMinute * 60 * 24 * 60, // 2 months
    },
    {
      name: "StableStaking",
      distributor: governor,
      reward: bond.address,
      staking: abt.address,
      duration: blocksPerMinute * 60 * 24 * 60, // 2 months
    },
  ];

  const {networkName} = d.getNetwork();
  const [timelock, issuer] = await d.deployed("Timelock", "Issuer");

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

  await d.send("Bond", "transferOwnership", [timelock.address]);
  await d.send("Investment", "transferOwnership", [timelock.address]);
  await d.send("Vesting", "transferOwnership", [timelock.address]);
  await d.send("Treasury", "transferOwnership", [timelock.address]);
  await d.send("Issuer", "transferOwnership", [timelock.address]);
  await d.send("ABT", "transferOwnership", [issuer.address]);
  await d.send("Market", "transferOwnership", [timelock.address]);
});
