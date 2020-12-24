const {contract, assert} = require("../../utils/test");

contract("Bond.constructor", ({artifacts}) => {
  it("constructor: should mint 10 million tokens", async () => {
    const instance = await artifacts.require("Bond");

    const balance = await instance.methods.totalSupply().call();

    assert.equal(
      balance,
      "10000000000000000000000000",
      "Started mint wasn' correctly taken to owner"
    );
  });
});
