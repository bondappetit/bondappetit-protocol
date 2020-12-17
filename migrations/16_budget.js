const {afterMigration} = require("./utils");
const networks = require("../networks");
const Budget = artifacts.require("Budget");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];
  const expenditures = [
      //{address: Bond.address, min: '0', target: '0'},
  ]

  await deployer.deploy(Budget, {
    from: Governor.address,
  });

  const budget = await Budget.deployed();
  await Promise.all(
    expenditures.map(({address, min, target}) => budget.changeExpenditure(address, min, target))
  );

  await afterMigration(network);
};
