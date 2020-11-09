const assertions = require("truffle-assertions");
const {utils} = require("web3");
const DepositaryOracle = artifacts.require("DepositaryOracle");
const {development} = require("../../networks");

contract("DepositaryOracle", (accounts) => {
  const governor = development.accounts.Governor.address;
  const notOwner = accounts[1];

  it("setDelay: should update delay", async () => {
    const instance = await DepositaryOracle.deployed();
    const startDelay = await instance.delay();

    const newDelay = startDelay.add(utils.toBN('1')).toString();
    await instance.setDelay(newDelay, {from: governor});
    const endDelay = await instance.delay();

    assert.equal(
      endDelay.toString(),
      newDelay.toString(),
      "Delay not updated"
    );
  });

  it("setDelay: should revert tx if sender not owner", async () => {
    const instance = await DepositaryOracle.deployed();

    await assertions.reverts(
      instance.setDelay("0", {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
