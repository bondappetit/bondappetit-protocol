const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.changeGovernanceTokenPrice", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeGovernanceTokenPrice: should change governance token price", async () => {
    const instance = await artifacts.require("Market");
    const startPrice = await instance.methods.governanceTokenPrice().call();
    const newPrice = bn(startPrice).add(bn("1000000")).toString();

    await instance.methods.changeGovernanceTokenPrice(newPrice).send({from: governor});
    assert.equal(
      await instance.methods.governanceTokenPrice().call(),
      newPrice,
      "Invalid governance token price"
    );
  });

  it("changeGovernanceTokenPrice: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Market");
    const [, notOwner] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.changeGovernanceTokenPrice("1000000").send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
