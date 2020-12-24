const {contract, assert} = require("../../utils/test");
const {development} = require("../../networks");

contract("Budget.getRecipients", ({artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("getRecipients: should get all recipients addresses", async () => {
    const instance = await artifacts.require("Budget");
    const contract = development.contracts.Bond.address;

    const firstRecipients = await instance.methods.getRecipients().call();
    assert.equal(
      firstRecipients.includes(contract),
      false,
      "Invalid first recipients list"
    );

    await instance.methods
      .changeExpenditure(contract, "10", "50")
      .send({from: governor});

    const secondRecipients = await instance.methods.getRecipients().call();
    assert.equal(
      secondRecipients.includes(contract),
      true,
      "Invalid second recipients list"
    );

    await instance.methods
      .changeExpenditure(contract, "0", "0")
      .send({from: governor});

    const lastRecipients = await instance.methods.getRecipients().call();
    assert.equal(
      lastRecipients.includes(contract),
      false,
      "Invalid last recipients list"
    );
  });
});
