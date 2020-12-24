const assertions = require("truffle-assertions");
const {contract, assert, bn} = require("../../utils/test");
const {development} = require("../../networks");

contract("Market.changeBondPrice", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changeBondPrice: should change bond price", async () => {
    const instance = await artifacts.require("Market");
    const startPrice = await instance.methods.bondPrice().call();
    const newPrice = bn(startPrice).add(bn("1000000")).toString();

    await instance.methods.changeBondPrice(newPrice).send({from: governor});
    assert.equal(
      await instance.methods.bondPrice().call(),
      newPrice,
      "Invalid bond price"
    );
  });

  it("changeBondPrice: should revert tx if called is not the owner", async () => {
    const instance = await artifacts.require("Market");
    const notOwner = (await web3.eth.getAccounts())[1];

    await assertions.reverts(
      instance.methods.changeBondPrice("1000000").send({from: notOwner}),
      "Ownable: caller is not the owner"
    );
  });
});
