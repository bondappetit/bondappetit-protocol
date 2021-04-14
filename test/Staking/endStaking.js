const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");

contract("Staking.stake", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const blocksPerMinute = 4;
  const duration = blocksPerMinute * 60 * 24 * 28; // 4 weeks
  let instance, gov;
  before(async () => {
    const currentBlock = await web3.eth.getBlockNumber();
    gov = await artifacts.require("GovernanceToken");
    instance = await artifacts.new(
      "contracts",
      "Staking",
      "LockStakingTest",
      [governor, duration, gov._address, gov._address, currentBlock + 4, 0],
      {
        from: governor,
        gas: 6000000,
      }
    );
  });

  it("stake: should revert tx if staking completed", async () => {
    const amount = "100";

    await gov.methods.approve(instance._address, amount).send({from: governor});
    await instance.methods.stake(amount).send({from: governor, gas: 6000000});

    await assertions.reverts(
      instance.methods.stake(amount).send({from: governor, gas: 6000000}),
      "Staking:stake: staking completed"
    );
  });

  it("changeStakingEndBlock: should revert tx if called is not the owner", async () => {
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeStakingEndBlock(10).send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
