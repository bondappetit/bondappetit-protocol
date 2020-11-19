const {delay} = require("./utils");
const networks = require("../networks");
const Treasury = artifacts.require("Treasury");

module.exports = async (deployer, network) => {
  const {
    accounts: {Governor},
  } = networks[network];

  await deployer.deploy(Treasury, {
    from: Governor.address,
  });

  if (network !== "development") await delay(30000);
};