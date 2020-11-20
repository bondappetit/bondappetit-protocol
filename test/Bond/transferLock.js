const assertions = require("truffle-assertions");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");
const dayjs = require("dayjs");

contract("Bond.transferLock", (accounts) => {
  const governor = development.accounts.Governor.address;
  const lockedAcc = accounts[1];
  const lockedAmount = 10;

  it("transferLock: should access control", async () => {
    const instance = await Bond.deployed();

    await assertions.reverts(
      instance.transferLock(
        lockedAcc,
        lockedAmount,
        dayjs().add(1, "day").unix(),
        {from: governor}
      ),
      "Bond::transferLock: access is denied"
    );
  });

  it("transferLock: should locked tokens", async () => {
    const instance = await Bond.deployed();

    await instance.allowTransferLock(governor, {from: governor});
    await instance.transferLock(
      lockedAcc,
      lockedAmount,
      dayjs().add(1, "day").unix(),
      {from: governor}
    );

    await assertions.reverts(
      instance.transfer(governor, lockedAmount, {from: lockedAcc}),
      "Bond::_transferTokens: amount are locked"
    );
  });

  it("transferLock: should transfer free tokens", async () => {
    const instance = await Bond.deployed();

    await instance.transfer(lockedAcc, 5, {from: governor});
    await instance.transfer(governor, 3, {from: lockedAcc});
    await assertions.reverts(
      instance.transfer(governor, 5, {from: lockedAcc}),
      "Bond::_transferTokens: amount are locked"
    );
    await instance.transfer(governor, 2, {from: lockedAcc});
  });

  it("transferLocK: should revert tx if change lock date", async () => {
    const instance = await Bond.deployed();

    await instance.allowTransferLock(governor, {from: governor});
    await assertions.reverts(
      instance.transferLock(lockedAcc, lockedAmount, 0, {from: governor}),
      "Bond::transferLock: lock date cannot be changed"
    );
  });

  it("transferLock: should transfer after locking date", async () => {
    const unlockedAcc = accounts[2];
    const unlockedAmount = 10;
    const lockSeconds = 2;
    const instance = await Bond.deployed();

    await instance.allowTransferLock(governor, {from: governor});
    await instance.transferLock(unlockedAcc, unlockedAmount, dayjs().add(lockSeconds, 'second').unix(), {from: governor});
    await assertions.reverts(
      instance.transfer(governor, unlockedAmount, {from: unlockedAcc}),
      "Bond::_transferTokens: amount are locked"
    );
    await new Promise(resolve => setTimeout(resolve, lockSeconds * 1000));
    await instance.transfer(governor, unlockedAmount, {from: unlockedAcc});
  });
});
