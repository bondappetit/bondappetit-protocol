const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("VestingSplitter.changeShares", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeShares: should update shares list", async () => {
    const instance = await artifacts.require("VestingSplitter");
    const [, accountA, accountB] = artifacts.accounts;
    const accounts = [accountA, accountB];
    const shares = ["85", "15"];

    await instance.methods
      .changeShares(accounts, shares)
      .send({from: governor, gas: 6000000});

    const [
      currentAccounts,
      shareOfFirstAccount,
      shareOfSecondAccount,
    ] = await Promise.all([
      instance.methods.getAccounts().call(),
      instance.methods.shareOf(accounts[0]).call(),
      instance.methods.shareOf(accounts[1]).call(),
    ]);
    assert.equal(currentAccounts.length, accounts.length, "Invalid accounts");
    assert.equal(
      shareOfFirstAccount,
      shares[0],
      "Invalid share of first account"
    );
    assert.equal(
      shareOfSecondAccount,
      shares[1],
      "Invalid second of first account"
    );
  });

  it("changeShares: should revert tx if accounts duplicate", async () => {
    const instance = await artifacts.require("VestingSplitter");
    const [, accountA] = artifacts.accounts;

    await assertions.reverts(
      instance.methods
        .changeShares([accountA, accountA], ["80", "20"])
        .send({from: governor, gas: 6000000}),
      "VestingSplitter::changeShares: duplicate account"
    );
  });

  it("changeShares: should revert tx if too many accounts", async () => {
    const instance = await artifacts.require("VestingSplitter");
    const [, account] = artifacts.accounts;

    const maxAccounts = await instance.methods.getMaxAccounts().call();
    const accounts = Array.from(
      new Array(parseInt(maxAccounts, 10) + 1).keys()
    ).map(() => account);
    const shares = Array.from(
      new Array(parseInt(maxAccounts, 10) + 1).keys()
    ).map(() => "1");

    await assertions.reverts(
      instance.methods
        .changeShares(accounts, shares)
        .send({from: governor, gas: 6000000}),
      "VestingSplitter::changeShares: too many accounts"
    );
  });

  it("changeShares: should revert tx if function information arity mismatch", async () => {
    const instance = await artifacts.require("VestingSplitter");
    const [, accountA, accountB] = artifacts.accounts;

    await assertions.reverts(
      instance.methods
        .changeShares([accountA, accountB], ["80"])
        .send({from: governor, gas: 6000000}),
      "VestingSplitter::changeShares: shares function information arity mismatch"
    );
  });

  it("changeShares: should revert tx if invalid share", async () => {
    const instance = await artifacts.require("VestingSplitter");
    const [, account] = artifacts.accounts;

    await assertions.reverts(
      instance.methods
        .changeShares([account], ["110"])
        .send({from: governor, gas: 6000000}),
      "VestingSplitter::changeShares: invalid value of share"
    );
    await assertions.reverts(
      instance.methods
        .changeShares([account], ["0"])
        .send({from: governor, gas: 6000000}),
      "VestingSplitter::changeShares: invalid value of share"
    );
  });

  it("changeShares: should revert tx if invalid share sum", async () => {
    const instance = await artifacts.require("VestingSplitter");
    const [, accountA, accountB] = artifacts.accounts;

    await assertions.reverts(
      instance.methods
        .changeShares([accountA, accountB], ["80", "30"])
        .send({from: governor, gas: 6000000}),
      "VestingSplitter::changeShares: invalid sum of shares"
    );
  });

  it("changeShares: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("VestingSplitter");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods
        .changeShares([], [])
        .send({from: notOwner, gas: 6000000}),
      "Ownable: caller is not the owner"
    );
  });
});
