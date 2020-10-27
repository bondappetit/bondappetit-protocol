const networks = require("../../networks");
const Investment = artifacts.require("Investment");

contract("Investment.investmentTokens", (accounts) => {
  const {USDC} = networks.development.assets;

  it("should allow invest tokens", async () => {
    const instance = await Investment.deployed();

    assert.equal(
      await instance.investmentTokens(USDC.address),
      true,
      "USDC allowed by default"
    );

    await instance.denyToken(USDC.address);
    assert.equal(
      await instance.investmentTokens(USDC.address),
      false,
      "USDC should be denied"
    );

    await instance.allowToken(USDC.address);
    assert.equal(
      await instance.investmentTokens(USDC.address),
      true,
      "USDC should be allowed"
    );
  });
});