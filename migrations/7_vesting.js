const {delay} = require('./utils');
const networks = require("../networks");
const Bond = artifacts.require("Bond");
const Vesting = artifacts.require("Vesting");
const dayjs = require("dayjs");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];
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

  await deployer.deploy(Vesting, Bond.address, {
    from: Governor.address,
  });

  const bond = await Bond.deployed();
  const vesting = await Vesting.deployed();
  await Promise.all(
    recipients.flatMap(({wallet, periods}) =>
      periods.map(async ({amount, date}) => {
        await bond.approve(Vesting.address, amount, {from: Governor.address});
        await vesting.lock(wallet, amount, date, {from: Governor.address});
      })
    )
  );

  if (network !== 'development') await delay(30000);
};
