const DepositaryOracle = artifacts.require("oracle/DepositaryOracle");
const SecurityOracle = artifacts.require("oracle/SecurityOracle");
const BondDepositaryBalanceView = artifacts.require(
  "oracle/BondDepositaryBalanceView"
);
const {development} = require("../../../networks");

contract("BondDepositaryBalanceView", () => {
  const governor = development.accounts.Governor.address;

  it("balance: get bond depositary balance", async () => {
    const depositaryOracle = await DepositaryOracle.deployed();
    const securityOracle = await SecurityOracle.deployed();
    const instance = await BondDepositaryBalanceView.deployed();

    const startBalance = await instance.balance();
    assert.equal(0, startBalance, "Start balance invalid");

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
          await depositaryOracle.put(isin, amount, {
            from: governor,
          });
        }
        if (nominalValue !== undefined) {
          const nominalValueBytes = web3.eth.abi.encodeParameters(
            ["uint256"],
            [nominalValue]
          );
          await securityOracle.put(isin, "nominalValue", nominalValueBytes, {
            from: governor,
          });
        }
      })
    );

    const endBalance = await instance.balance();
    assert.equal(45, endBalance, "End balance invalid");
  });
});
