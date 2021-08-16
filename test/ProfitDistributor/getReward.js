const {web3, deployments} = require("hardhat");
const {contract, assert, bn} = require("../../utils/test");

contract("ProfitDistributor.getReward", function () {
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

    const distributorData = await deployments.deploy("ProfitDistributor", {
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

  it("getReward: should return half reward to lock period", async function () {
    await distributor.methods.stake(10).send({from: account});
    const startBalance = await token.methods.balanceOf(account).call();
    await distributor.methods.notifyRewardAmount(100).send({from: account});

    assert.equal(
      await distributor.methods.earned(account).call(),
      "0",
      "Invalid first earned"
    );
    assert.equal(
      await distributor.methods.penalty(account).call(),
      "0",
      "Invalid first penalty"
    );
    await web3.eth.sendTransaction({from: account, to: account});
    assert.equal(
      await distributor.methods.earned(account).call(),
      "14",
      "Invalid second earned"
    );
    assert.equal(
      await distributor.methods.penalty(account).call(),
      "0",
      "Invalid second penalty"
    );

    await distributor.methods.getReward().send({from: account});
    assert.equal(
      await distributor.methods.earned(account).call(),
      "0",
      "Invalid end earned"
    );
    assert.equal(
      await distributor.methods.penalty(account).call(),
      "14",
      "Invalid end penalty"
    );

    assert.equal(
      await token.methods.balanceOf(account).call(),
      bn(startBalance).add(bn("14")).toString(),
      "Invalid end balance"
    );
  });

  it("getReward: should return all reward to unlock period", async function () {
    await web3.eth.sendTransaction({from: account, to: account});
    await web3.eth.sendTransaction({from: account, to: account});
    const startBalance = await token.methods.balanceOf(account).call();
    const earned = await distributor.methods.earned(account).call();
    const penalty = await distributor.methods.penalty(account).call();
    const rewardRate = await distributor.methods.rewardRate().call();

    await distributor.methods.getReward().send({from: account});

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
        .add(bn(earned))
        .add(bn(rewardRate))
        .add(bn(penalty))
        .toString(),
      "Invalid end balance"
    );
  });
});
