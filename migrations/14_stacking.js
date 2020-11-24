const {afterMigration} = require("./utils");
const networks = require("../networks");
const ABT = artifacts.require("ABT");
const Bond = artifacts.require("Bond");
const Stacking = artifacts.require("Stacking");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];
  const rewardingTokens = [
      {address: Bond.address, delta: '70000000000'},
      {address: ABT.address, delta: '70000000000'},
  ]

  await deployer.deploy(Stacking, Bond.address, {
    from: Governor.address,
  });

  const stacking = await Stacking.deployed();
  await Promise.all(
    rewardingTokens.map(({address, delta}) => stacking.changeReward(address, delta))
  );

  await afterMigration(network);
};
