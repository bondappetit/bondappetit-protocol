const assertions = require("truffle-assertions");
const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Staking.withdraw", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
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
      [governor, duration, gov._address, gov._address, 0, currentBlock + 5],
      {
        from: governor,
        gas: 6000000,
      }
    );
  });

  it("withdraw: should revert tx if unstaking not started", async () => {
    const amount = "100";

    await gov.methods.approve(instance._address, amount).send({from: governor});
    await instance.methods.stake(amount).send({from: governor, gas: 6000000});

    await assertions.reverts(
      instance.methods.withdraw(amount).send({from: governor, gas: 6000000}),
      "Staking:withdraw: unstaking not started"
    );

    await instance.methods.withdraw(amount).send({from: governor, gas: 6000000});
  });

  it("changeUnstakingStartBlock: should revert tx if called is not the owner", async () => {
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeUnstakingStartBlock(10).send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
