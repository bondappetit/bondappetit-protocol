const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("CollateralMarket.buy", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("buy: should transfer tokens to depositary and return stable token", async () => {
    const [
      instance,
      gov,
      stable,
      depositary,
      issuer,
    ] = await artifacts.requireAll(
      "CollateralMarket",
      "GovernanceToken",
      "StableToken",
      "StableTokenDepositaryBalanceView",
      "Issuer"
    );
    const amount = "1000";
    await instance.methods.allowToken(gov._address).send({from: governor});
    await depositary.methods.allowToken(gov._address).send({from: governor});
    await stable.methods
      .transferOwnership(issuer._address)
      .send({from: governor});

    const startTotalSupply = await stable.methods.totalSupply().call();
    const startBalance = await stable.methods.balanceOf(governor).call();
    const startDepositaryBalance = await depositary.methods.balance().call();

    await gov.methods.approve(instance._address, amount).send({from: governor});
    await instance.methods
      .buy(gov._address, amount)
      .send({from: governor, gas: 6000000});

    assert.equal(
      await stable.methods.totalSupply().call(),
      bn(startTotalSupply).add(bn(amount)).toString(),
      "Invalid end total supply"
    );
    assert.equal(
      await stable.methods.balanceOf(governor).call(),
      bn(startBalance).add(bn(amount)).toString(),
      "Invalid end account balance"
    );
    assert.equal(
      await depositary.methods.balance().call(),
      bn(startDepositaryBalance).add(bn(amount)).toString(),
      "Invalid end depositary"
    );
  });

  it("buy: should revert tx if token not allowed", async () => {
    const [instance, stable] = await artifacts.requireAll(
      "CollateralMarket",
      "StableToken"
    );
    const amount = "1000";

    await stable.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await assertions.reverts(
      instance.methods
        .buy(stable._address, amount)
        .send({from: governor, gas: 6000000}),
      "CollateralMarket::buy: token is not allowed"
    );
  });

  it("buy: should revert tx if contract paused", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "CollateralMarket",
      "GovernanceToken"
    );
    await instance.methods.pause().send({from: governor});

    await assertions.reverts(
      instance.methods
        .buy(gov._address, "1000")
        .send({from: governor, gas: 6000000}),
      "Pausable: paused"
    );
  });
});
