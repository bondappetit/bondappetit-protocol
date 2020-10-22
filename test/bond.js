const {utils} = require("web3");
const assertions = require("truffle-assertions");
const Bond = artifacts.require("Bond");
const dayjs = require("dayjs");

contract("Bond:base", (accounts) => {
  const [accA, accB] = accounts;

  it("should mint 10 million tokens", async () => {
    const instance = await Bond.deployed();

    const balance = await instance.balanceOf(accA);

    assert.equal(
      balance.toString(),
      utils.toBN("10000000000000000000000000").toString(),
      "Started mint wasn' correctly taken to owner"
    );
  });

  it("should transfer token", async () => {
    const instance = await Bond.deployed();
    const amount = 10;

    const [startBalanceA, startBalanceB] = await Promise.all([
      instance.balanceOf.call(accA),
      instance.balanceOf.call(accB),
    ]);

    await instance.transfer(accB, amount, {from: accA});

    const [endBalanceA, endBalanceB] = await Promise.all([
      instance.balanceOf.call(accA),
      instance.balanceOf.call(accB),
    ]);

    assert.equal(
      endBalanceA.toString(),
      startBalanceA.sub(utils.toBN(amount)).toString(),
      "Amount wasn't correctly taken from the sender"
    );
    assert.equal(
      endBalanceB.toString(),
      startBalanceB.add(utils.toBN(amount)).toString(),
      "Amount wasn't correctly taken from the recipient"
    );
  });
});

contract("Bond:lock", (accounts) => {
  const [acc, lockedAcc, partiallyAcc, freeAcc] = accounts;

  it("should locked tokens", async () => {
    const amount = 10;
    const instance = await Bond.deployed();

    await instance.transferLock(lockedAcc, amount, {from: acc});

    await assertions.reverts(
      instance.transfer(acc, amount, {from: lockedAcc}),
      "Bond::unlockingTransfer: amount are locked"
    );
  });

  it("should transfer free tokens", async () => {
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

  it("should transfer after locking date", async () => {
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
