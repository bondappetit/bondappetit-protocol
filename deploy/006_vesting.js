const {migration} = require("../utils/deploy");
const dayjs = require("dayjs");

module.exports = migration("Vesting", async (d) => {
  const recipients = [
    /*
    {
      wallet: "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f",
      periods: [
        {
          amount: "100",
          date: dayjs().add(10, "second").unix(),
        },
      ],
    },
    */
  ];

  const [gov] = await d.deployed("GovernanceToken");
  const vesting = await d.deploy("Vesting", {
    args: [gov.address],
  });

  await recipients.reduce(async (tx, {wallet, periods}) => {
    await tx;

    await periods.reduce(async (tx, {amount, date}) => {
      await tx;

      await d.send("GovenanceToken", "approve", [vesting.address, amount]);
      await d.send("Vesting", "lock", [wallet, amount, date]);
    }, Promise.resolve());
  }, Promise.resolve());
});
