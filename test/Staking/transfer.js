const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Staking.transfer", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("transfer: should transfer reward token to recipient", async () => {
    const [instance, bond] = await artifacts.requireAll("GovStaking", "Bond");
    const amount = "1000000";

    const startBalance = await bond.methods.balanceOf(governor).call();

    await bond.methods
      .transfer(instance._address, amount)
      .send({from: governor});

    const balanceAfterTransfer = await bond.methods.balanceOf(governor).call();
    assert.equal(
      balanceAfterTransfer < startBalance,
      true,
      "Invalid balance after transfer"
    );

    await instance.methods.transfer(governor, amount).send({from: governor});

    const endBalance = await bond.methods.balanceOf(governor).call();
    assert.equal(endBalance, startBalance, "Invalid end balance");
  });

  it("transfer: should revert tx if distribution started", async () => {
    const [instance, bond] = await artifacts.requireAll("GovStaking", "Bond");
    const amount = "1000000";

    await bond.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .notifyRewardAmount(amount)
      .send({from: governor, gas: 6000000});

    await assertions.reverts(
      instance.methods.transfer(governor, amount).send({from: governor}),
      "Staking::transfer: distribution not ended"
    );
  });

  it("transfer: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("GovStaking");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.transfer(notOwner, "1").send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
