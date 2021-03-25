const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("CompoundDepositaryBalanceView.invest", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const erc20ABI = development.contracts.Stable.abi;
  const cTokenAddress = "0x2973e69b20563bcc66dC63Bde153072c33eF37fe";
  const tokenAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";

  it("invest: should invest tokens", async () => {
    const instance = await artifacts.require("CompoundDepositaryBalanceView");
    const cToken = new web3.eth.Contract(erc20ABI, cTokenAddress);
    const token = new web3.eth.Contract(erc20ABI, tokenAddress);
    const amount = "100";

    const startBalance = await token.methods.balanceOf(governor).call();
    const startInvestedTokens = await instance.methods.investedTokens().call();
    assert.equal(startBalance > amount, true, "Invalid start balance");
    assert.equal(
      startInvestedTokens.includes(cTokenAddress),
      false,
      "Invalid start invested tokens"
    );

    await token.methods
      .approve(instance._address, amount)
      .send({from: governor});
    await instance.methods
      .invest(cTokenAddress, amount)
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
    assert.equal(
      endBalance,
      bn(startBalance).sub(bn(amount)).toString(),
      "Invalid end balance"
    );
    assert.equal(
      endInvestedTokens.includes(cTokenAddress),
      true,
      "Invalid end invested tokens"
    );
    assert.equal(investBalance, amount, "Invalid invest balance");
    assert.equal(
      depositaryBalance,
      bn(amount)
        .mul(bn(10).pow(bn(12)))
        .toString(),
      "Invalid depositary balance"
    );
    assert.equal(cTokenBalance > 0, true, "Invalid depositary cToken balance");
  });

  it("invest: should revert tx if zero amount", async () => {
    const instance = await artifacts.require("CompoundDepositaryBalanceView");

    await assertions.reverts(
      instance.methods.invest(cTokenAddress, "0").send({
        from: governor,
      }),
      "CompoundDepositaryBalanceView::invest: invalid amount"
    );
  });

  it("invest: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("CompoundDepositaryBalanceView");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.invest(cTokenAddress, "100").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
