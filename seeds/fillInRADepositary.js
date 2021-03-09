const hardhat = require("hardhat");
const {development} = require("../networks");

async function main() {
  const governor = development.accounts.Governor.address;
  const assets = [
      {
          id: 'USD',
          amount: '116210700000',
          price: '1',
          updatedAt: '1614758670',
          data: 'USD|116210.70|1614758670|Client#2017-0010029',
          signature: 'H3r/1jeFrmPkbqLwqeTPopNRHKBoqbiHe5zmFI1fR5fqkplBAEv+Dwklj+rMeOlRVghDjoyfY/cQ6kSSXSaevVHbwy79hzQucyJ3GDeUgBbjdI64kIHlyqSM/M1e9vWdbNQqOKUHlNa258vwBeEtO4feP7KcFtbsb2weVLtY3MU=',
      },
      {
          id: 'XS1533921299',
          amount: '1000',
          price: '1016540000',
          updatedAt: '1614758670',
          data: 'XS1533921299|1000|1614758670|Client#2017-0010029',
          signature: 'dyVaJ1EFE1bUR4gdVgd+iu8J15b8DaIGAZ8OJHqpUu7FQkMSdsB2ge7zp6xcTBoWtMMLYYirLQqgdCjuBMTfcZvpefKtonVHyvFP5XJ1kPfmZv+LHd3QilzaFnYQ5Km3bn+Dej1SU8K1QYSohZEJ7Wpi1wAZBhrFhd2zowSEvC8=',
      },
      {
          id: 'US247361ZZ42',
          amount: '250',
          price: '1092900000',
          updatedAt: '1614758670',
          data: 'US247361ZZ42|250|1614758670|Client#2017-0010029',
          signature: 'CVfr6oXDjW/sThCIZQph0/m2vYLLtRYWbCjcDXOaNBiSEJ/kDceloHOKJNGsNOoqi2xJot+D8GP9jK52NjggEvy0BnAMVK7Xd9W398WoK/SNuh2dshu2s1De7qHzZAq6ZSorTwvTHywtDIGWi+aKilYMmf2CEaBoozg89Id8uNQ=',
      },
  ];

  await assets.reduce(async (prev, {id, amount, price, updatedAt, data, signature}) => {
    await prev;

    await hardhat.deployments.execute(
        "RealAssetDepositaryBalanceView",
        {from: governor},
        "put",
        id,
        amount,
        price,
        updatedAt,
        data,
        signature
    );
  }, Promise.resolve());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });