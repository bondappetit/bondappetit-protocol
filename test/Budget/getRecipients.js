const Budget = artifacts.require("Budget");
const Bond = artifacts.require("Bond");
const {development} = require("../../networks");

contract("Budget.getRecipients", (accounts) => {
  const governor = development.accounts.Governor.address;

  it("getRecipients: should get all recipients addresses", async () => {
    const instance = await Budget.deployed();
    const contract = Bond.address;

    const firstRecipients = await instance.getRecipients();
    assert.equal(firstRecipients.includes(contract), false, "Invalid first recipients list");

    await instance.changeExpenditure(contract, '10', '50', {from: governor});

    const secondRecipients = await instance.getRecipients();
    assert.equal(secondRecipients.includes(contract), true, "Invalid second recipients list");

    await instance.changeExpenditure(contract, '0', '0', {from: governor});

    const lastRecipients = await instance.getRecipients();
    assert.equal(lastRecipients.includes(contract), false, "Invalid last recipients list");
  });
});
