const {migration, bn} = require("../../../utils/deploy");
const dayjs = require("dayjs");

module.exports = migration("Vesting.lock", async (d) => {
  const govTotalSupply = await d.call("GovernanceToken", "totalSupply", []);
  const amount = bn(govTotalSupply).div(bn(100)).mul(bn(20)).div(bn(40)).toString(); // 0.5%
  const recipients = [
    {
      wallet: "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f",
      periods: [
        {
          amount,
          description: 'test1',
          date: dayjs("2022-01-01T00:00:00.000Z").unix(),
        },
        {
          amount,
          description: 'test2',
          date: dayjs("2023-01-01T00:00:00.000Z").unix(),
        },
        {
          amount,
          description: 'test3',
          date: dayjs("2024-01-01T00:00:00.000Z").unix(),
        },
        {
          amount,
          description: 'test4',
          date: dayjs("2025-01-01T00:00:00.000Z").unix(),
        },
      ],
    },
  ];

  const [vesting] = await d.deployed("Vesting");

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
