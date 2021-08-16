const {web3, deployments} = require("hardhat");
const {contract, assert, bn} = require("../../utils/test");

contract("ProfitDistributor.withdrawLock", function () {
  let token, distributor, account;
  const lockPeriod = 5;
  const unlockPeriod = 2;
  before(async function () {
    [account] = await web3.eth.getAccounts();

    const tokenData = await deployments.deploy("MockERC20", {
      args: ["Test", "T", 1000],
      from: account,
    });
    token = new web3.eth.Contract(tokenData.abi, tokenData.address);

    const distributorData = await deployments.deploy("ProfitDistributor.lock", {
      contract: 'ProfitDistributor',
      args: [
        account,
        lockPeriod + unlockPeriod,
        tokenData.address,
        tokenData.address,
        lockPeriod,
        unlockPeriod,
      ],
      from: account,
    });
    distributor = new web3.eth.Contract(
      distributorData.abi,
      distributorData.address
    );

    await token.methods
      .transfer(distributor._address, 100)
      .send({from: account});
    await token.methods
      .approve(distributor._address, 1000)
      .send({from: account});
  });

  it("withdraw: should return half reward to lock period", async function () {
    await distributor.methods.stake(10).send({from: account});
    const startBalance = await token.methods.balanceOf(account).call();
    await distributor.methods.notifyRewardAmount(100).send({from: account});

    await web3.eth.sendTransaction({from: account, to: account});
    await web3.eth.sendTransaction({from: account, to: account});
    const {locked} = await distributor.methods.lockInfo(account).call();
    assert.equal(locked, true, "Invalid locked flag");
    const startRewardRate = await distributor.methods.rewardRate().call();

    await distributor.methods.exit().send({from: account});

    assert.equal(
      await distributor.methods.earned(account).call(),
      "0",
      "Invalid end earned"
    );
    assert.equal(
      await distributor.methods.penalty(account).call(),
      "0",
      "Invalid end penalty"
    );
    assert.equal(
      await token.methods.balanceOf(account).call(),
      bn(startBalance)
        .add(bn("10")) // staked
        .add(bn("14").mul(bn("3")).div(bn("2"))) // half reward
        .toString(),
      "Invalid end balance"
    );
    assert.equal(
      await distributor.methods.rewardRate().call(),
      bn(startRewardRate).add(bn("5")).toString(),
      "Invalid end reward rate"
    );
  });
});
