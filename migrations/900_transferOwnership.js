const {delay} = require('./utils');
const networks = require("../networks");
const Timelock = artifacts.require("Timelock");
const Bond = artifacts.require("Bond");
const Investment = artifacts.require("Investment");
const Vesting = artifacts.require("Vesting");

module.exports = async (deployer, network) => {
  if (network === "development") return;

  const {
    accounts: {Governor},
  } = networks[network];

  const bond = await Bond.deployed();
  const investment = await Investment.deployed();
  const vesting = await Vesting.deployed();
  await bond.transferOwnership(Timelock.address, {from: Governor.address});
  await investment.transferOwnership(Timelock.address, {from: Governor.address});
  await vesting.transferOwnership(Timelock.address, {from: Governor.address});

  if (network !== 'development') await delay(30000);
};
