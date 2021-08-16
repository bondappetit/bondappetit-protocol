const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("YieldEscrow.voteDelegator", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const amount = bn(100).mul(bn(1e18)).toString();

  it("createVoteDelegator: should create new vote delegator contract", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "YieldEscrow",
      "GovernanceToken"
    );

    const startVoteDelegatorAddress = await instance.methods
      .voteDelegatorOf(governor)
      .call();
    assert.equal(
      startVoteDelegatorAddress,
      "0x0000000000000000000000000000000000000000",
      "Invalid start vote delegator address"
    );

    await gov.methods.approve(instance._address, amount).send({from: governor});
    await instance.methods.deposit(amount).send({from: governor});
    const startEscrowGovBalance = await gov.methods
      .balanceOf(instance._address)
      .call();

    await instance.methods
      .createVoteDelegator()
      .send({from: governor, gas: 6000000});

    const endVoteDelegatorAddress = await instance.methods
      .voteDelegatorOf(governor)
      .call();
    const {abi} = await artifacts.artifact("contracts", "VoteDelegator");
    const voteDelegator = new web3.eth.Contract(abi, endVoteDelegatorAddress);
    assert.equal(
      endVoteDelegatorAddress !== "0x0000000000000000000000000000000000000000",
      true,
      "Invalid end vote delegator address"
    );
    assert.equal(
      (await gov.methods.delegates(endVoteDelegatorAddress).call()) ===
        governor,
      true,
      "Invalid vote delegate account"
    );
    assert.equal(
      await gov.methods.balanceOf(instance._address).call(),
      bn(startEscrowGovBalance).sub(bn(amount)).toString(),
      "Invalid end escrow gov token balance"
    );
    assert.equal(
      await gov.methods.balanceOf(endVoteDelegatorAddress).call(),
      amount,
      "Invalid end gov token amount balance"
    );
    assert.equal(
      await voteDelegator.methods.owner().call(),
      governor,
      "Invalid vote delegator owner"
    );
  });

  it("createVoteDelegator: should revert tx if vote delegator already created", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");

    await assertions.reverts(
      instance.methods.createVoteDelegator().send({from: governor}),
      "YieldEscrow::createVoteDelegator: votes delegator already created"
    );
  });

  it("deposit: should get gov token and mint ve token", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "YieldEscrow",
      "GovernanceToken"
    );

    await gov.methods.mint(governor, amount).send({from: governor});
    const startAccountGovBalance = await gov.methods.balanceOf(governor).call();
    const startAccountVeGovBalance = await instance.methods
      .balanceOf(governor)
      .call();
    const startVeGovTotalSupply = await instance.methods.totalSupply().call();
    const {abi} = await artifacts.artifact("contracts", "VoteDelegator");
    const voteDelegator = new web3.eth.Contract(
      abi,
      await instance.methods.voteDelegatorOf(governor).call()
    );
    const startVoteDelegatorGovBalance = await gov.methods
      .balanceOf(voteDelegator._address)
      .call();
    const startAccountVotes = await gov.methods
      .getCurrentVotes(governor)
      .call();

    await gov.methods
      .approve(voteDelegator._address, amount)
      .send({from: governor});
    await voteDelegator.methods
      .deposit(amount)
      .send({from: governor, gas: 2000000});

    assert.equal(
      await gov.methods.balanceOf(governor).call(),
      bn(startAccountGovBalance).sub(bn(amount)).toString(),
      "Invalid end account gov token balance"
    );
    assert.equal(
      await gov.methods.balanceOf(voteDelegator._address).call(),
      bn(startVoteDelegatorGovBalance).add(bn(amount)).toString(),
      "Invalid end vote delegator gov token balance"
    );
    assert.equal(
      await instance.methods.balanceOf(governor).call(),
      bn(startAccountVeGovBalance).add(bn(amount)).toString(),
      "Invalid end vegov token balance"
    );
    assert.equal(
      await instance.methods.totalSupply().call(),
      bn(startVeGovTotalSupply).add(bn(amount)).toString(),
      "Invalid end vegov token total supply"
    );
    assert.equal(
      await gov.methods.getCurrentVotes(governor).call(),
      bn(startAccountVotes).add(bn(amount)).toString(),
      "Invalid end account votes"
    );
  });

  it("withdraw: should get ve token and return gov token", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "YieldEscrow",
      "GovernanceToken"
    );

    const startAccountGovBalance = await gov.methods.balanceOf(governor).call();
    const startAccountVeGovBalance = await instance.methods
      .balanceOf(governor)
      .call();
    const startVeGovTotalSupply = await instance.methods.totalSupply().call();
    const {abi} = await artifacts.artifact("contracts", "VoteDelegator");
    const voteDelegator = new web3.eth.Contract(
      abi,
      await instance.methods.voteDelegatorOf(governor).call()
    );
    const startVoteDelegatorGovBalance = await gov.methods
      .balanceOf(voteDelegator._address)
      .call();
    const startAccountVotes = await gov.methods
      .getCurrentVotes(governor)
      .call();

    await voteDelegator.methods
      .withdraw(amount)
      .send({from: governor, gas: 2000000});

    assert.equal(
      await gov.methods.balanceOf(governor).call(),
      bn(startAccountGovBalance).add(bn(amount)).toString(),
      "Invalid end account gov token balance"
    );
    assert.equal(
      await gov.methods.balanceOf(voteDelegator._address).call(),
      bn(startVoteDelegatorGovBalance).sub(bn(amount)).toString(),
      "Invalid end vote delegator gov token balance"
    );
    assert.equal(
      await instance.methods.balanceOf(governor).call(),
      bn(startAccountVeGovBalance).sub(bn(amount)).toString(),
      "Invalid end vegov token balance"
    );
    assert.equal(
      await instance.methods.totalSupply().call(),
      bn(startVeGovTotalSupply).sub(bn(amount)).toString(),
      "Invalid end vegov token total supply"
    );
    assert.equal(
      await gov.methods.getCurrentVotes(governor).call(),
      bn(startAccountVotes).sub(bn(amount)).toString(),
      "Invalid end account votes"
    );
  });

  it("deposit: should revert tx if amount negative or zero", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");
    const {abi} = await artifacts.artifact("contracts", "VoteDelegator");
    const voteDelegator = new web3.eth.Contract(
      abi,
      await instance.methods.voteDelegatorOf(governor).call()
    );

    await assertions.reverts(
      voteDelegator.methods.deposit(0).send({from: governor}),
      "YieldEscrow::depositFromDelegator: negative or zero amount"
    );
  });

  it("deposit: should revert tx if called is not the owner ", async () => {
    const [, notOwner] = artifacts.accounts;
    const [instance] = await artifacts.requireAll("YieldEscrow");
    const {abi} = await artifacts.artifact("contracts", "VoteDelegator");
    const voteDelegator = new web3.eth.Contract(
      abi,
      await instance.methods.voteDelegatorOf(governor).call()
    );

    await assertions.reverts(
      voteDelegator.methods.deposit(1).send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });

  it("withdraw: should revert tx if amount negative or zero", async () => {
    const [instance] = await artifacts.requireAll("YieldEscrow");
    const {abi} = await artifacts.artifact("contracts", "VoteDelegator");
    const voteDelegator = new web3.eth.Contract(
      abi,
      await instance.methods.voteDelegatorOf(governor).call()
    );

    await assertions.reverts(
      voteDelegator.methods.withdraw(0).send({from: governor}),
      "YieldEscrow::withdrawFromDelegator: negative or zero amount"
    );
  });

  it("withdraw: should revert tx if called is not the owner ", async () => {
    const [, notOwner] = artifacts.accounts;
    const [instance] = await artifacts.requireAll("YieldEscrow");
    const {abi} = await artifacts.artifact("contracts", "VoteDelegator");
    const voteDelegator = new web3.eth.Contract(
      abi,
      await instance.methods.voteDelegatorOf(governor).call()
    );

    await assertions.reverts(
      voteDelegator.methods.withdraw(1).send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });

  it("destroyVoteDelegator: should destroy vote delegator contract", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "YieldEscrow",
      "GovernanceToken"
    );

    await gov.methods.mint(governor, amount).send({from: governor});
    const {abi} = await artifacts.artifact("contracts", "VoteDelegator");
    const voteDelegator = new web3.eth.Contract(
      abi,
      await instance.methods.voteDelegatorOf(governor).call()
    );

    await gov.methods
      .approve(voteDelegator._address, amount)
      .send({from: governor});
    await voteDelegator.methods
      .deposit(amount)
      .send({from: governor, gas: 2000000});
    const startEscrowGovBalance = await gov.methods
      .balanceOf(instance._address)
      .call();
    const startVoteDelegatorGovBalance = await gov.methods
      .balanceOf(voteDelegator._address)
      .call();
    const startAccountVeGovBalance = await instance.methods
      .balanceOf(governor)
      .call();
    const startVeGovTotalSupply = await instance.methods.totalSupply().call();
    await instance.methods.destroyVoteDelegator().send({from: governor});

    const endVoteDelegatorAddress = await instance.methods
      .voteDelegatorOf(governor)
      .call();
    assert.equal(
      endVoteDelegatorAddress === "0x0000000000000000000000000000000000000000",
      true,
      "Invalid end vote delegator address"
    );
    assert.equal(
      await gov.methods.balanceOf(instance._address).call(),
      bn(startEscrowGovBalance)
        .add(bn(startVoteDelegatorGovBalance))
        .toString(),
      "Invalid end escrow gov token balance"
    );
    assert.equal(
      await instance.methods.balanceOf(governor).call(),
      startAccountVeGovBalance,
      "Invalid end vegov token balance"
    );
    assert.equal(
      await instance.methods.totalSupply().call(),
      startVeGovTotalSupply,
      "Invalid end vegov token total supply"
    );
  });
});
