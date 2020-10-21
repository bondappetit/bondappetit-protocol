const SafeMath = artifacts.require("SafeMath");
const Timelock = artifacts.require("Timelock");

module.exports = async (deployer) => {
  await deployer.deploy(SafeMath);
  await deployer.link(SafeMath, Timelock);
  await deployer.deploy(
    Timelock,
    "0x87aa18a47EeE34F47187159Ba3431aF143a5ceA8",
    2 * 24 * 60 * 60
  );
};
