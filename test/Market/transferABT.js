const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.transferABT", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("transferABT: should transfer ABT tokens", async () => {
    const [instance, abt] = await artifacts.requireAll("Market", "ABT");
    const recipient = (await web3.eth.getAccounts())[1];
    const amount = "1000000";

    assert.equal(
      await abt.methods.balanceOf(recipient).call(),
      "0",
      "Invalid start balance"
    );

    await abt.methods.mint(instance._address, amount).send({from: governor});
    await instance.methods
      .transferABT(recipient, amount)
      .send({from: governor});
    assert.equal(
      await abt.methods.balanceOf(recipient).call(),
      amount,
      "Invalid end balance"
    );
  });

  it("approve: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Market");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.transferABT(notOwner, "1000000").send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
