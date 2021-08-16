const {web3, deployments} = require("hardhat");
const {contract, assert, bn} = require("../../utils/test");

contract("ProfitDistributor.acceptClaims", function () {
  let token, distributor, account;
  const lockPeriod = 3;
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
  });

  it("lockInfo: should return lock information for account", async function () {
    await token.methods.approve(distributor._address, 10).send({from: account});
    await distributor.methods.stake(10).send({from: account});

    const lockInfo = await distributor.methods.lockInfo(account).call();
    assert.equal(lockInfo.locked, true, "Invalid locked flag");
    assert.equal(lockInfo.mod, "0", "Invalid lock mod");
    assert.equal(
      lockInfo.nextUnlock,
      bn(lockInfo.stakeAt).add(bn(lockPeriod)).toString(),
      "Invalid next unlock block"
    );
    assert.equal(
      lockInfo.nextLock,
      bn(lockInfo.stakeAt).add(bn(lockPeriod)).add(bn(unlockPeriod)).toString(),
      "Invalid next lock block"
    );
  });

  it("lockInfo: should return lock information for unlock period", async function () {
    await web3.eth.sendTransaction({from: account, to: account});
    await web3.eth.sendTransaction({from: account, to: account});
    await web3.eth.sendTransaction({from: account, to: account});

    const lockInfo = await distributor.methods.lockInfo(account).call();
    assert.equal(lockInfo.locked, false, "Invalid locked flag");
    assert.equal(lockInfo.mod, "3", "Invalid lock mod");
    assert.equal(
      lockInfo.nextUnlock,
      bn(lockInfo.stakeAt).add(bn(lockPeriod)).toString(),
      "Invalid next unlock block"
    );
    assert.equal(
      lockInfo.nextLock,
      bn(lockInfo.stakeAt).add(bn(lockPeriod)).add(bn(unlockPeriod)).toString(),
      "Invalid next lock block"
    );
  });

  it("lockInfo: should return lock information for next lock period", async function () {
    await web3.eth.sendTransaction({from: account, to: account});
    await web3.eth.sendTransaction({from: account, to: account});

    const lockInfo = await distributor.methods.lockInfo(account).call();
    assert.equal(lockInfo.locked, true, "Invalid locked flag");
    assert.equal(lockInfo.mod, "0", "Invalid lock mod");
    assert.equal(
      lockInfo.nextUnlock,
      bn(lockInfo.stakeAt)
        .add(bn(lockPeriod))
        .add(bn(unlockPeriod))
        .add(bn(lockPeriod))
        .toString(),
      "Invalid next unlock block"
    );
    assert.equal(
      lockInfo.nextLock,
      bn(lockInfo.stakeAt)
        .add(bn(lockPeriod))
        .add(bn(unlockPeriod))
        .add(bn(lockPeriod))
        .add(bn(unlockPeriod))
        .toString(),
      "Invalid next lock block"
    );
  });
});
