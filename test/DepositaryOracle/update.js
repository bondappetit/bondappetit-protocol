const DepositaryOracle = artifacts.require("DepositaryOracle");
const {development} = require("../../networks");

contract("DepositaryOracle", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("update: should update data", async () => {
    const instance = await DepositaryOracle.deployed();
    const startLastUpdate = await instance.lastUpdate();

    const newData = "test";
    await instance.update(newData, startLastUpdate, {from: governor});
    const endData = await instance.data();
    assert.equal(endData, newData, "Update data failed");
  });
});
