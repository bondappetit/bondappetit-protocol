const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Treasury.approve", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("approve: should approve target token", async () => {
    const [instance, bond] = await artifacts.requireAll("Treasury", "Bond");
    const accountWithoutTokens = (await web3.eth.getAccounts())[1];
    const amount = "10";

    await bond.methods
      .transfer(instance._address, amount)
      .send({from: governor});
    const startAccountAllowance = await bond.methods
      .allowance(instance._address, accountWithoutTokens)
      .call();
    assert.equal(startAccountAllowance, "0", "Invalid start account allowance");

    await instance.methods
      .approve(bond._address, accountWithoutTokens, amount)
      .send({
        from: governor,
      });
    const endAccountAllowance = await bond.methods
      .allowance(instance._address, accountWithoutTokens)
      .call();
    assert.equal(endAccountAllowance, amount, "Invalid end account allowance");
  });

  it("approve: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Treasury");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.approve(governor, governor, 10).send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
