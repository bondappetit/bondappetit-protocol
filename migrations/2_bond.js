const networks = require("../networks");
const Bond = artifacts.require("Bond");
const dayjs = require("dayjs");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(
    Bond,
    Governor.address,
    dayjs().add(18, "month").unix() // Unlocking after 18 months
  );
};
