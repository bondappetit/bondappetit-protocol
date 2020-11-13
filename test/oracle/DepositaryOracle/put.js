const assertions = require("truffle-assertions");
const DepositaryOracle = artifacts.require("oracle/DepositaryOracle");
const {development} = require("../../../networks");

contract("DepositaryOracle", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("put: should add security to depositary", async () => {
    const instance = await DepositaryOracle.deployed();
    const amount = 10;

    const startSecurity = await instance.get("test bond");
    assert.equal("0", startSecurity.amount, "Start security amount invalid");

    await instance.put("test bond", amount, {
      from: governor,
    });
    const endSecurity = await instance.get("test bond");
    assert.equal(amount, endSecurity.amount, "End security amount invalid");
  });

  it("put: should revert tx if sender not owner", async () => {
    const instance = await DepositaryOracle.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.put("test bond", 10, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
