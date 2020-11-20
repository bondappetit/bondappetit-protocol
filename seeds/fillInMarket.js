const Bond = artifacts.require("Bond");
const ABT = artifacts.require("ABT");
const Market = artifacts.require("Market");
const {development} = require("../networks");

const governor = development.accounts.Governor.address;
module.exports = async (callback) => {
  try {
    const bond = await Bond.deployed();
    const abt = await ABT.deployed();
    const amount = "1000000000000000000000";

    await bond.mint(Market.address, amount, {from: governor});
    await abt.mint(Market.address, amount, {from: governor});

    callback();
  } catch (e) {
    callback(e);
  }
};
