const Market = artifacts.require("Market");

contract("Market", (accounts) => {
  const token = accounts[1];

  it("allowToken: should allow tokens", async () => {
    const instance = await Market.deployed();

    assert.equal(
      false,
      await instance.allowedTokens(token),
      "Invalid allowed token by default"
    );

    await instance.allowToken(token);
    assert.equal(
      true,
      await instance.allowedTokens(token),
      "Invalid allowed token"
    );
  });

  it("denyToken: should deny tokens", async () => {
    const instance = await Market.deployed();

    assert.equal(
      true,
      await instance.allowedTokens(token),
      "Invalid denied token by default"
    );

    await instance.denyToken(token);
    assert.equal(
      false,
      await instance.allowedTokens(token),
      "Invalid denied token"
    );
  });
});