const assertions = require("truffle-assertions");
const Buyback = artifacts.require("Buyback");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("Buyback.changeUniswapRouter", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("changeUniswapRouter: should change uniswap router address", async () => {
    const instance = await Buyback.deployed();
    const contract = Bond.address;

    const startRouter = await instance.uniswapRouter();
    assert.equal(
        startRouter != contract,
        true,
        "Invalid start router"
    );

    await instance.changeUniswapRouter(contract, {from: governor});

    const endRouter = await instance.uniswapRouter();
    assert.equal(
        endRouter == contract,
        true,
        "Invalid end router"
    );
  });

  it("changeUniswapRouter: should revert tx if sender not owner", async () => {
    const instance = await Buyback.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.changeUniswapRouter(governor, {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
