const Bond = artifacts.require("Bond");
const Stacking = artifacts.require("Stacking");
const {development} = require("../networks");

const governor = development.accounts.Governor.address;
module.exports = async (callback) => {
  try {
    const bond = await Bond.deployed();
    const amount = "1000000000000000000000";

    await bond.mint(Stacking.address, amount, {from: governor});

    callback();
  } catch (e) {
    callback(e);
  }
};
