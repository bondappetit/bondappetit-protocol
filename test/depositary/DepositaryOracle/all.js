const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("DepositaryOracle.all", ({artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("all: get all securities of depositary", async () => {
    const instance = await artifacts.require("DepositaryOracle");

    const startList = await instance.methods.all().call();
    assert.equal(startList.length, 0, "Start security list length invalid");

    const bondA = {
      isin: "A",
      amount: "10",
    };
    const bondB = {
      isin: "B",
      amount: "0",
    };
    await instance.methods.put(bondA.isin, bondA.amount).send({
      from: governor,
    });
    await instance.methods.put(bondB.isin, bondB.amount).send({
      from: governor,
    });

    const endList = await instance.methods.all().call();
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
