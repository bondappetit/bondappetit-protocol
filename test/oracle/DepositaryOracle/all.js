const DepositaryOracle = artifacts.require("oracle/DepositaryOracle");
const {development} = require("../../../networks");

contract("DepositaryOracle.all", () => {
  const governor = development.accounts.Governor.address;

  it("all: get all securities of depositary", async () => {
    const instance = await DepositaryOracle.deployed();

    const startList = await instance.all();
    assert.equal(0, startList.length, "Start security list length invalid");

    const bondA = {
      isin: "A",
      amount: 10,
    };
    const bondB = {
      isin: "B",
      amount: 0,
    };
    await instance.put(bondA.isin, bondA.amount, {
      from: governor,
    });
    await instance.put(bondB.isin, bondB.amount, {
      from: governor,
    });

    const endList = await instance.all();
    assert.equal(endList.length, 2, "End security list length invalid");
    assert.equal(
      endList[0].isin,
      bondA.isin,
      "End security list isin A invalid"
    );
    assert.equal(
      endList[0].amount,
      bondA.amount,
      "End security list A amount invalid"
    );
    assert.equal(
      endList[1].isin,
      bondB.isin,
      "End security list isin B invalid"
    );
    assert.equal(
      endList[1].amount,
      bondB.amount,
      "End security list amount B invalid"
    );
  });
});
