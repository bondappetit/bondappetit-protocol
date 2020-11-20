const Market = artifacts.require("Market");

contract("Market.allowedToken", (accounts) => {
  const token = accounts[1];

  it("allowToken: should allow tokens", async () => {
    const instance = await Market.deployed();

    assert.equal(
      await instance.isAllowedToken(token),
      false,
      "Invalid allowed token by default"
    );

    await instance.allowToken(token, 'test');
    assert.equal(
      await instance.isAllowedToken(token),
      true,
      "Invalid allowed token"
    );
  });

  it("denyToken: should deny tokens", async () => {
    const instance = await Market.deployed();

    assert.equal(
      await instance.isAllowedToken(token),
      true,
      "Invalid denied token by default"
    );

    await instance.denyToken(token);
    assert.equal(
      await instance.isAllowedToken(token),
      false,
      "Invalid denied token"
    );
  });
});