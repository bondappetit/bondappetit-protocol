const assertions = require("truffle-assertions");
const SecurityOracle = artifacts.require("oracle/SecurityOracle");
const {development} = require("../../../networks");

contract("SecurityOracle", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("put: should add security property value to oracle", async () => {
    const instance = await SecurityOracle.deployed();
    const isin = "test bond";
    const prop = "nominalValue";
    const value = 10;
    const valueBytes = web3.eth.abi.encodeParameters(["uint256"], [value]);

    await instance.put(isin, prop, valueBytes);

    const endValue = await instance.get(isin, prop);
    assert.equal(valueBytes, endValue, "End value bytes invalid");
    const decodedValue = web3.eth.abi.decodeParameters(["uint256"], endValue)[0];
    assert.equal(value, decodedValue, "End value invalid");
  });

  it("put: should revert tx if sender not owner", async () => {
    const instance = await SecurityOracle.deployed();
    const notOwner = accounts[1];

    await assertions.reverts(
      instance.put("test bond", "nominalValue", "0x0", {
        from: notOwner,
      }),
      "Ownable: caller is not the owner"
    );
  });
});
