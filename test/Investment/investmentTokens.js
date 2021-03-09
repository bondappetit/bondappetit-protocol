const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Investment.investmentTokens", ({artifacts}) => {
  const governor = development.accounts.Governor.address;
  const {USDC} = development.assets;

  it("should allow invest tokens", async () => {
    const instance = await artifacts.require("Investment");

    const startAllowedTokens = await instance.methods.allowedTokens().call();
    assert.equal(
      startAllowedTokens.includes(USDC.address),
      true,
      "USDC allowed by default"
    );

    await instance.methods.denyToken(USDC.address).send({from: governor});
    const firstAllowedTokens = await instance.methods.allowedTokens().call();
    assert.equal(
      firstAllowedTokens.includes(USDC.address),
      false,
      "USDC should be denied"
    );

    await instance.methods.allowToken(USDC.address).send({from: governor});
    const secondAllowedTokens = await instance.methods.allowedTokens().call();
    assert.equal(
      secondAllowedTokens.includes(USDC.address),
      true,
      "USDC should be allowed"
    );
  });
});
