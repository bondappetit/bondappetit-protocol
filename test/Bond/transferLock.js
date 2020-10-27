const assertions = require("truffle-assertions");
const Bond = artifacts.require("Bond");
const dayjs = require("dayjs");

contract("Bond.transferLock", (accounts) => {
  const [acc, lockedAcc, partiallyAcc, freeAcc] = accounts;

  it("transferLock: should locked tokens", async () => {
    const amount = 10;
    const instance = await Bond.deployed();

    await instance.transferLock(lockedAcc, amount, {from: acc});

    await assertions.reverts(
      instance.transfer(acc, amount, {from: lockedAcc}),
      "Bond::unlockingTransfer: amount are locked"
    );
  });

  it("transferLock: should transfer free tokens", async () => {
    const instance = await Bond.deployed();

    await instance.transferLock(partiallyAcc, 10, {from: acc});
    await instance.transfer(partiallyAcc, 5, {from: acc});
    await instance.transfer(acc, 3, {from: partiallyAcc});
    await assertions.reverts(
      instance.transfer(acc, 5, {from: partiallyAcc}),
      "Bond::unlockingTransfer: amount are locked"
    );
    await instance.transfer(acc, 2, {from: partiallyAcc});
  });

  it("transferLock: should transfer after locking date", async () => {
    const amount = 10;
    const instance = await Bond.new(acc, dayjs().add(2, "second").unix());

    await instance.transferLock(freeAcc, amount, {from: acc});
    await assertions.reverts(
      instance.transfer(acc, amount, {from: freeAcc}),
      "Bond::unlockingTransfer: amount are locked"
    );
    await new Promise(resolve => setTimeout(resolve, 2000));
    await instance.transfer(acc, amount, {from: freeAcc});
  });
});
