const ABT = artifacts.require("ABT");

contract("ABT", (accounts) => {
  it("constructor: should mint 0 tokens", async () => {
    const instance = await ABT.deployed();

    const balance = await instance.totalSupply();
    assert.equal(
      balance.toString(),
      "0",
      "Invalid start mint token"
    );
  });
});
