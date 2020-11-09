const assertions = require("truffle-assertions");
const {utils} = require("web3");
const DepositaryOracle = artifacts.require("DepositaryOracle");
const {development} = require("../../networks");

contract("DepositaryOracle", (accounts) => {
  const governor = development.accounts.Governor.address;
  const notOwner = accounts[1];

  it("update: should revert tx if sender not allowed", async () => {
    const instance = await DepositaryOracle.deployed();
    const lastUpdate = await instance.lastUpdate();

    await assertions.reverts(
      instance.update('test', lastUpdate, {
        from: notOwner,
      }),
      "DepositaryOracle::update: access denied"
    );
  });

  it("update: should revert tx if data not changed", async () => {
    const instance = await DepositaryOracle.deployed();
    const currentData = await instance.data();
    const lastUpdate = await instance.lastUpdate();

    await assertions.reverts(
      instance.update(currentData, lastUpdate, {
        from: governor,
      }),
      "DepositaryOracle::update: data not updated"
    );
  });

  it("update: should revert tx if last update changed", async () => {
    const instance = await DepositaryOracle.deployed();
    const lastUpdate = await instance.lastUpdate();
    const invalidLastUpdate = lastUpdate.add(utils.toBN('1')).toString();

    await assertions.reverts(
      instance.update('test', invalidLastUpdate, {
        from: governor,
      }),
      "DepositaryOracle::update: outdated"
    );
  });

  it("update: should revert tx if last update is not delayed", async () => {
    const instance = await DepositaryOracle.deployed();
    const lastUpdate = await instance.lastUpdate();

    await instance.update('test', lastUpdate, {from: governor});
    const newLastUpdate = await instance.lastUpdate();
    await assertions.reverts(
      instance.update('next test', newLastUpdate, {
        from: governor,
      }),
      "DepositaryOracle::update: early"
    );
  });
});
