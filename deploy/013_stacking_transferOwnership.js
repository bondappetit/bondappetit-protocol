const {migration} = require("../utils/deploy");

module.exports = migration("Stacking", async (d) => {
  const [abt, bond] = await d.deployed("ABT", "Bond");
  const rewardingTokens = [
    {address: bond.address, delta: "70000000000"},
    {address: abt.address, delta: "70000000000"},
  ];

  await d.deploy("Stacking", {
    args: [bond.address],
  });

  await rewardingTokens.reduce(async (tx, {address, delta}) => {
    await tx;
    await d.send("Stacking", "changeReward", [address, delta]);
  }, Promise.resolve());

  const {networkName} = d.getNetwork();
  if (networkName === "development") return;

  const [timelock, issuer] = await d.deployed("Timelock", "Issuer");

  await d.send("Bond", "transferOwnership", [timelock.address]);
  await d.send("Investment", "transferOwnership", [timelock.address]);
  await d.send("Vesting", "transferOwnership", [timelock.address]);
  await d.send("Treasury", "transferOwnership", [timelock.address]);
  await d.send("Issuer", "transferOwnership", [timelock.address]);
  await d.send("ABT", "transferOwnership", [issuer.address]);
  await d.send("Market", "transferOwnership", [timelock.address]);
  await d.send("Stacking", "transferOwnership", [timelock.address]);
});
