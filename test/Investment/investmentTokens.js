const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Investment.investmentTokens", ({artifacts}) => {
  const governor = development.accounts.Governor.address;
  const {USDC} = development.assets;

  it("should allow invest tokens", async () => {
    const instance = await artifacts.require("Investment");

    assert.equal(
      await instance.methods.investmentTokens(USDC.address).call(),
      true,
      "USDC allowed by default"
    );

    await instance.methods.denyToken(USDC.address).send({from: governor});
    assert.equal(
      await instance.methods.investmentTokens(USDC.address).call(),
      false,
      "USDC should be denied"
    );

    await instance.methods.allowToken(USDC.address).send({from: governor});
    assert.equal(
      await instance.methods.investmentTokens(USDC.address).call(),
      true,
      "USDC should be allowed"
    );
  });
});
