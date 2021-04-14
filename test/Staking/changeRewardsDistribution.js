const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");

contract("Staking.changeRewardsDistribution", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("changeRewardsDistribution: should change reward distribution address", async () => {
    const instance = await artifacts.require("GovStaking");
    const [, newDistributor] = artifacts.accounts;

    const startDistributor = await instance.methods.rewardsDistribution().call();
    await instance.methods
      .changeRewardsDistribution(newDistributor)
      .send({from: governor});

    const endDistributor = await instance.methods.rewardsDistribution().call();
    assert.equal(
      endDistributor !== startDistributor,
      true,
      "Change distributor failed"
    );
  });

  it("changeRewardsDistribution: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("GovStaking");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeRewardsDistribution(governor).send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
