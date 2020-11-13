const DepositaryOracle = artifacts.require("oracle/DepositaryOracle");
const {development} = require("../../../networks");

contract("DepositaryOracle", () => {
  const governor = development.accounts.Governor.address;

  it("all: get all securities of depositary", async () => {
    const instance = await DepositaryOracle.deployed();

    const startList = await instance.all();
    assert.equal(0, startList.length, "Start security list length invalid");

    const bondA = {
        isin: 'A',
        amount: 10,
    };
    const bondB = {
        isin: 'B',
        amount: 0,
    };
    await instance.put(bondA.isin, bondA.amount, {
      from: governor,
    });
    await instance.put(bondB.isin, bondB.amount, {
      from: governor,
    });

    const endList = await instance.all();
    assert.equal(2, endList.length, "End security list length invalid");
    assert.equal(bondA.isin, endList[0].isin, "End security list isin A invalid");
    assert.equal(bondA.amount, endList[0].amount, "End security list A amount invalid");
    assert.equal(bondB.isin, endList[1].isin, "End security list isin B invalid");
    assert.equal(bondB.amount, endList[1].amount, "End security list amount B invalid");
  });
});