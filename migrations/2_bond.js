const Bond = artifacts.require("Bond");
const dayjs = require("dayjs");

module.exports = async (deployer) => {
  await deployer.deploy(
    Bond,
    "0x87aa18a47EeE34F47187159Ba3431aF143a5ceA8", // First account
    dayjs().add(18, "month").unix() // Unlocking after 18 months
  );
};
