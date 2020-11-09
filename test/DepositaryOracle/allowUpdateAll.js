const assertions = require("truffle-assertions");
const DepositaryOracle = artifacts.require("DepositaryOracle");
const {development} = require("../../networks");

contract("DepositaryOracle", (accounts) => {
  const governor = development.accounts.Governor.address;
  const notOwner = accounts[1];

  it("setAllowUpdateAll: should update allow list", async () => {
    const instance = await DepositaryOracle.deployed();
    const startIsUpdateAllow = await instance.isUpdateAllowed(notOwner);
    assert.equal(startIsUpdateAllow, false, "Invalid update allow list");

    await instance.setAllowUpdateAll(true, {from: governor});
    const endIsUpdateAllow = await instance.isUpdateAllowed(notOwner);
    assert.equal(endIsUpdateAllow, true, "Update allow list failed");
  });

  it("setAllowUpdateAll: should revert tx if sender not owner", async () => {
    const instance = await DepositaryOracle.deployed();

    await assertions.reverts(
      instance.setAllowUpdateAll(true, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
