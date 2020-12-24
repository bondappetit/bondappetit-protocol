const {contract, assert} = require("../../utils/test");

contract("ABT.constructor", ({artifacts}) => {
  it("constructor: should mint 0 tokens", async () => {
    const instance = await artifacts.require("ABT");

    const balance = await instance.methods.totalSupply().call();
    assert.equal(balance, "0", "Invalid start mint token");
  });
});
