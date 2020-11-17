const {delay} = require('./utils');
const networks = require("../networks");
const Timelock = artifacts.require("Timelock");
const Bond = artifacts.require("Bond");
const ABT = artifacts.require("ABT");
const Investment = artifacts.require("Investment");
const Vesting = artifacts.require("Vesting");
const Treasury = artifacts.require("Treasury");
const Issuer = artifacts.require("Issuer");

module.exports = async (deployer, network) => {
  if (network === "development") return;

  const {
    accounts: {Governor},
  } = networks[network];

  const [
    bond,
    abt,
    investment,
    vesting,
    treasury,
    issuer
  ] = await Promise.all([
    Bond.deployed(),
    ABT.deployed(),
    Investment.deployed(),
    Vesting.deployed(),
    Treasury.deployed(),
    Issuer.deployed(),
  ])
  await bond.transferOwnership(Timelock.address, {from: Governor.address});
  await investment.transferOwnership(Timelock.address, {from: Governor.address});
  await vesting.transferOwnership(Timelock.address, {from: Governor.address});
  await treasury.transferOwnership(Timelock.address, {from: Governor.address});
  await issuer.transferOwnership(Timelock.address, {from: Governor.address});
  await abt.transferOwnership(Issuer.address, {from: Governor.address});

  if (network !== 'development') await delay(30000);
};
