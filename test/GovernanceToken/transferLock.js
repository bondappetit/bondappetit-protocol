const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");
const dayjs = require("dayjs");

contract("GovernanceToken.transferLock", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const lockedAmount = "10";

  it("transferLock: should access control", async () => {
    const instance = await artifacts.require("GovernanceToken");
    const [, lockedAcc] = artifacts.accounts;

    await assertions.reverts(
      instance.methods
        .transferLock(lockedAcc, lockedAmount, dayjs().add(1, "day").unix())
        .send({from: governor}),
      "GovernanceToken::transferLock: access is denied"
    );
  });

  it("transferLock: should locked tokens", async () => {
    const instance = await artifacts.require("GovernanceToken");
    const [, lockedAcc] = artifacts.accounts;

    await instance.methods.allowTransferLock(governor).send({from: governor});
    await instance.methods
      .transferLock(lockedAcc, lockedAmount, dayjs().add(1, "day").unix())
      .send({from: governor});

    await assertions.reverts(
      instance.methods.transfer(governor, lockedAmount).send({from: lockedAcc}),
      "GovernanceToken::_transferTokens: amount are locked"
    );
  });

  it("transferLock: should transfer free tokens", async () => {
    const instance = await artifacts.require("GovernanceToken");
    const [, lockedAcc] = artifacts.accounts;

    await instance.methods.transfer(lockedAcc, 5).send({from: governor});
    await instance.methods.transfer(governor, 3).send({from: lockedAcc});
    await assertions.reverts(
      instance.methods.transfer(governor, 5).send({from: lockedAcc}),
      "GovernanceToken::_transferTokens: amount are locked"
    );
    await instance.methods.transfer(governor, 2).send({from: lockedAcc});
  });

  it("transferLocK: should revert tx if change lock date", async () => {
    const instance = await artifacts.require("GovernanceToken");
    const [, lockedAcc] = artifacts.accounts;

    await instance.methods.allowTransferLock(governor).send({from: governor});
    await assertions.reverts(
      instance.methods
        .transferLock(lockedAcc, lockedAmount, 0)
        .send({from: governor}),
      "GovernanceToken::transferLock: lock date cannot be changed"
    );
  });

  it("transferLock: should transfer after locking date", async () => {
    const instance = await artifacts.require("GovernanceToken");
    const [, , unlockedAcc] = artifacts.accounts;
    const unlockedAmount = "10";
    const lockSeconds = "2";

    await instance.methods.allowTransferLock(governor).send({from: governor});
    await instance.methods
      .transferLock(
        unlockedAcc,
        unlockedAmount,
        dayjs().add(lockSeconds, "second").unix()
      )
      .send({from: governor});
    await assertions.reverts(
      instance.methods
        .transfer(governor, unlockedAmount)
        .send({from: unlockedAcc}),
      "GovernanceToken::_transferTokens: amount are locked"
    );
    await new Promise((resolve) => setTimeout(resolve, lockSeconds * 1000));
    await instance.methods
      .transfer(governor, unlockedAmount)
      .send({from: unlockedAcc});
  });
});
