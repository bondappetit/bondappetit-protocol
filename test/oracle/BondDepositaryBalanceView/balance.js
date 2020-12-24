const {contract, assert} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("BondDepositaryBalanceView.balance", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("balance: get bond depositary balance", async () => {
    const [depositaryOracle, securityOracle, instance] = await artifacts.requireAll(
      "DepositaryOracle",
      "SecurityOracle",
      "BondDepositaryBalanceView"
    );

    const startBalance = await instance.methods.balance().call();
    assert.equal(startBalance, "0", "Start balance invalid");

    const bonds = [
      {
        isin: "A",
        amount: 10,
        nominalValue: 2,
      },
      {
        isin: "B",
        amount: 5,
        nominalValue: 5,
      },
      {
        isin: "C",
        amount: 0,
        nominalValue: 5,
      },
      {
        isin: "D",
        amount: 1,
      },
    ];
    await Promise.all(
      bonds.map(async ({isin, amount, nominalValue}) => {
        if (amount !== undefined) {
          await depositaryOracle.methods.put(isin, amount).send({
            from: governor,
          });
        }
        if (nominalValue !== undefined) {
          const nominalValueBytes = web3.eth.abi.encodeParameters(
            ["uint256"],
            [nominalValue]
          );
          await securityOracle.methods
            .put(isin, "nominalValue", nominalValueBytes)
            .send({
              from: governor,
            });
        }
      })
    );

    const endBalance = await instance.methods.balance().call();
    assert.equal(endBalance, "45", "End balance invalid");
  });
});
