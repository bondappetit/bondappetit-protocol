const Bond = artifacts.require("Bond");
const Timelock = artifacts.require("Timelock");
const GovernorAlpha = artifacts.require("GovernorAlpha");

module.exports = async (deployer) => {
  await deployer.deploy(
    GovernorAlpha,
    Timelock.address,
    Bond.address,
    "0x87aa18a47EeE34F47187159Ba3431aF143a5ceA8"
  );
};
