const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("VestingSplitter.vestingWithdraw", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeShares: should update shares list", async () => {
    const [instance, vesting, gov] = await artifacts.requireAll(
      "VestingSplitter",
      "Vesting",
      "GovernanceToken"
    );
    const amount = "100";

    await gov.methods.approve(vesting._address, amount).send({from: governor});
    const {
      events: {
        Locked: {
          returnValues: {periodId},
        },
      },
    } = await vesting.methods
      .lock(instance._address, amount, "test", "0")
      .send({from: governor, gas: 6000000});
    const startBalance = await gov.methods.balanceOf(instance._address).call();

    await instance.methods
      .vestingWithdraw(periodId)
      .send({from: governor, gas: 6000000});
    const endBalance = await gov.methods.balanceOf(instance._address).call();
    assert.equal(
      endBalance,
      bn(startBalance).add(bn(amount)).toString(),
      "End balance invalid"
    );
  });
});
