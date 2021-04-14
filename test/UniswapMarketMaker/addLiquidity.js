const {contract, assert, bn} = require("../../utils/test");

contract("UniswapMarketMaker.addLiquidity", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("addLiquidity: should add liquidity to pool", async () => {
    const [instance, stable, gov] = await artifacts.requireAll(
      "UniswapMarketMaker",
      "StableToken",
      "GovernanceToken"
    );
    const stableAmount = "5000";
    const govAmount = "10000";

    await stable.methods.mint(governor, stableAmount).send({from: governor});

    await instance.methods
      .changeIncoming(stable._address, governor)
      .send({from: governor});
    await stable.methods.transfer(instance._address, stableAmount).send({
      from: governor,
      gas: 2000000,
    });
    await gov.methods.transfer(instance._address, govAmount).send({
      from: governor,
      gas: 2000000,
    });

    await instance.methods
      .addLiquidity(0, 0)
      .send({from: governor, gas: 6000000});
    const endStableBalance = await stable.methods.balanceOf(instance._address).call();
    const endGovBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    assert.equal(endStableBalance, "0", "Invalid end stable balance");
    assert.equal(endGovBalance, "0", "Invalid end governance balance");
  });
});
