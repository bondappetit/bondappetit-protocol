const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");

contract("UniswapMarketMaker.changeUniswapRouter", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;

  it("changeUniswapRouter: should change uniswap router address", async () => {
    const instance = await artifacts.require("UniswapMarketMaker");
    const contract = network.contracts.Governance.address;

    const startRouter = await instance.methods.uniswapRouter().call();
    assert.equal(startRouter != contract, true, "Invalid start router");

    await instance.methods.changeUniswapRouter(contract).send({from: governor});

    const endRouter = await instance.methods.uniswapRouter().call();
    assert.equal(endRouter == contract, true, "Invalid end router");
  });

  it("changeUniswapRouter: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("UniswapMarketMaker");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeUniswapRouter(governor).send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
