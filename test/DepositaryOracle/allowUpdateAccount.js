const assertions = require("truffle-assertions");
const DepositaryOracle = artifacts.require("DepositaryOracle");
const {development} = require("../../networks");

contract("DepositaryOracle", (accounts) => {
  const governor = development.accounts.Governor.address;
  const notOwner = accounts[1];

  it("setAllowUpdate: should update allow list", async () => {
    const instance = await DepositaryOracle.deployed();
    const startIsUpdateAllow = await instance.isUpdateAllowed(notOwner);
    assert.equal(startIsUpdateAllow, false, "Invalid update allow list");

    await instance.setAllowUpdateAccount(notOwner, true, {from: governor});
    const endIsUpdateAllow = await instance.isUpdateAllowed(notOwner);
    assert.equal(endIsUpdateAllow, true, "Update allow list failed");
  });

  it("setAllowUpdate: should revert tx if sender not owner", async () => {
    const instance = await DepositaryOracle.deployed();

    await assertions.reverts(
      instance.setAllowUpdateAccount(notOwner, true, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
