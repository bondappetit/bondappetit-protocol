const assertions = require("truffle-assertions");
const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("SecurityOracle.put", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("put: should add security property value to oracle", async () => {
    const instance = await artifacts.require("SecurityOracle");
    const isin = "test bond";
    const prop = "nominalValue";
    const value = "10";
    const valueBytes = web3.eth.abi.encodeParameters(["uint256"], [value]);

    await instance.methods.put(isin, prop, valueBytes).send({from: governor});

    const endValue = await instance.methods.get(isin, prop).call();
    assert.equal(endValue, valueBytes, "End value bytes invalid");
    const decodedValue = web3.eth.abi.decodeParameters(
      ["uint256"],
      endValue
    )[0];
    assert.equal(decodedValue, value, "End value invalid");
  });

  it("put: should revert tx if sender not owner", async () => {
    const instance = await artifacts.require("SecurityOracle");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.put("test bond", "nominalValue", "0x0").send({
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
