const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("ProfitSplitter.changeUniswapRouter", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeUniswapRouter: should change uniswap router address", async () => {
    const instance = await artifacts.require("ProfitSplitter");
    const contract = development.contracts.Governance.address;

    const startRouter = await instance.methods.uniswapRouter().call();
    assert.equal(startRouter != contract, true, "Invalid start router");

    await instance.methods.changeUniswapRouter(contract).send({from: governor});

    const endRouter = await instance.methods.uniswapRouter().call();
    assert.equal(endRouter == contract, true, "Invalid end router");
  });

  it("changeUniswapRouter: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("ProfitSplitter");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeUniswapRouter(governor).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
