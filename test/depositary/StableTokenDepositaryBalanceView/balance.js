const {contract, assert, bn} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("StableTokenDepositaryBalanceView.balance", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("balance: should return balances of all allowed tokens in contract", async () => {
    const [instance, gov, stable] = await artifacts.requireAll("StableTokenDepositaryBalanceView", "GovernanceToken", "StableToken");
    const amount = '100';

    await instance.methods.allowToken(gov._address).send({from: governor});
    await instance.methods.allowToken(stable._address).send({from: governor});

    await gov.methods.mint(instance._address, amount).send({from: governor});
    await stable.methods.mint(instance._address, amount).send({from: governor});

    assert.equal(
        await instance.methods.balance().call(),
        bn(amount).add(bn(amount)).toString(),
        "Invalid start balance"
    );

    await instance.methods.denyToken(stable._address).send({from: governor});

    assert.equal(
        await instance.methods.balance().call(),
        amount,
        "Invalid end balance"
    );
  });
});