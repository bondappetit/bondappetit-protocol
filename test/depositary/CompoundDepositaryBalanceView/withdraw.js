const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("CompoundDepositaryBalanceView.withdraw", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const erc20ABI = development.contracts.Stable.abi;
  const cTokenAddress = "0x2973e69b20563bcc66dC63Bde153072c33eF37fe";
  const tokenAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";

  it("withdraw: should withdraw tokens", async () => {
    const instance = await artifacts.require("CompoundDepositaryBalanceView");
    const cToken = new web3.eth.Contract(erc20ABI, cTokenAddress);
    const token = new web3.eth.Contract(erc20ABI, tokenAddress);
    const amount = "10000";

    const startBalance = await token.methods.balanceOf(governor).call();
    assert.equal(startBalance > amount, true, "Invalid start balance");

    await token.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .invest(cTokenAddress, amount)
      .send({from: governor, gas: 6000000});

    const startInvestedTokens = await instance.methods.investedTokens().call();
    assert.equal(
      startInvestedTokens.includes(cTokenAddress),
      true,
      "Invalid start invested tokens"
    );

    await token.methods.transfer(governor, "0").send({from: governor}); // next block

    await instance.methods
      .withdraw(cTokenAddress, governor, governor)
      .send({from: governor, gas: 6000000});

    const endBalance = await token.methods.balanceOf(governor).call();
    const endInvestedTokens = await instance.methods.investedTokens().call();
    const cTokenBalance = await cToken.methods
      .balanceOf(instance._address)
      .call();
    const investBalance = await instance.methods
      .balanceOf(cTokenAddress)
      .call();
    const depositaryBalance = await instance.methods.balance().call();
    assert.equal(endBalance, startBalance, "Invalid end balance");
    assert.equal(
      endInvestedTokens.includes(cTokenAddress),
      false,
      "Invalid end invested tokens"
    );
    assert.equal(investBalance, "0", "Invalid invest balance");
    assert.equal(depositaryBalance, "0", "Invalid depositary balance");
    assert.equal(cTokenBalance, "0", "Invalid depositary cToken balance");
  });

  it("invest: should revert tx if zero invest", async () => {
    const instance = await artifacts.require("CompoundDepositaryBalanceView");

    await assertions.reverts(
      instance.methods.withdraw(cTokenAddress, governor, governor).send({
        from: governor,
      }),
      "CompoundDepositaryBalanceView::withdraw: token not invested"
    );
  });

  it("invest: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("CompoundDepositaryBalanceView");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.withdraw(cTokenAddress, governor, governor).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
