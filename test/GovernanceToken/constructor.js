const {contract, assert} = require("../../utils/test");

contract("GovernanceToken.constructor", ({artifacts}) => {
  it("constructor: should mint 10 million tokens", async () => {
    const instance = await artifacts.require("GovernanceToken");

    const balance = await instance.methods.totalSupply().call();

    assert.equal(
      balance,
      "10000000000000000000000000",
      "Started mint wasn' correctly taken to owner"
    );
  });
});
