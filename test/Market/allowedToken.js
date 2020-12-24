const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.allowedToken", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;
  const token = governor;

  it("allowToken: should allow tokens", async () => {
    const instance = await artifacts.require("Market");

    assert.equal(
      await instance.methods.isAllowedToken(token).call(),
      false,
      "Invalid allowed token by default"
    );

    await instance.methods.allowToken(token, "test").send({from: governor});
    assert.equal(
      await instance.methods.isAllowedToken(token).call(),
      true,
      "Invalid allowed token"
    );
  });

  it("denyToken: should deny tokens", async () => {
    const instance = await artifacts.require("Market");

    assert.equal(
      await instance.methods.isAllowedToken(token).call(),
      true,
      "Invalid denied token by default"
    );

    await instance.methods.denyToken(token).send({from: governor});
    assert.equal(
      await instance.methods.isAllowedToken(token).call(),
      false,
      "Invalid denied token"
    );
  });
});
