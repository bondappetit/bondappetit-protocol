const Bond = artifacts.require("Bond");

contract("Bond", () => {
  it("constructor: should mint 10 million tokens", async () => {
    const instance = await Bond.deployed();

    const balance = await instance.totalSupply();

    assert.equal(
      balance.toString(),
      "10000000000000000000000000",
      "Started mint wasn' correctly taken to owner"
    );
  });
});
