const {migration, bn} = require("../../../utils/deploy");
const dayjs = require("dayjs");

module.exports = migration("Vesting.lock", async (d) => {
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const [vesting, splitter] = await d.deployed("Vesting", "VestingSplitter");
  const vestingAmount = bn(govTotalSupply).div(bn(5)).toString(); // 20%
  const recipients = [
    {
      wallet: splitter.address,
      periods: [
        {
          amount: bn(vestingAmount).div(bn(100)).mul(bn(40)).toString(), // 40%
          description: "BondAppétite team & future team members",
          date: dayjs("2022-04-01T03:00:00.000Z").unix(),
        },
        {
          amount: bn(vestingAmount).div(bn(100)).mul(bn(30)).toString(), // 30%
          description: "BondAppétite team & future team members",
          date: dayjs("2023-04-01T03:00:00.000Z").unix(),
        },
        {
          amount: bn(vestingAmount).div(bn(100)).mul(bn(20)).toString(), // 20%
          description: "BondAppétite team & future team members",
          date: dayjs("2024-04-01T03:00:00.000Z").unix(),
        },
        {
          amount: bn(vestingAmount).div(bn(100)).mul(bn(10)).toString(), // 10%
          description: "BondAppétite team & future team members",
          date: dayjs("2025-04-01T03:00:00.000Z").unix(),
        },
      ],
    },
  ];

  await recipients.reduce(async (tx, {wallet, periods}) => {
    await tx;

    const currentPeriods = await d.call("Vesting", "info", [wallet]);
    const currentPeriodsSet = new Set(
      currentPeriods.map(({amount, date}) => `${amount}_${date}`)
    );

    await periods.reduce(async (tx, {amount, description, date}) => {
      await tx;

      const periodKey = `${amount}_${date}`;
      if (currentPeriodsSet.has(periodKey)) {
        console.log(
          `Period "${periodKey}" for wallet "${wallet}" already locked`
        );
        return Promise.resolve();
      }

      await d.send("GovernanceToken", "approve", [vesting.address, amount]);
      await d.send("Vesting", "lock", [wallet, amount, description, date]);
    }, Promise.resolve());
  }, Promise.resolve());
});
