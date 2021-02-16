const {contract, assert, bn} = require("../../../utils/test");
const {development} = require("../../../networks");

contract("RealAssetDepositaryBalanceView.balance", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("balance: get real asset depositary balance", async () => {
    const instance = await artifacts.require("RealAssetDepositaryBalanceView");
    const startBalance = await instance.methods.balance().call();
    const assets = [
      {
        id: "A",
        amount: "10",
        price: "2",
        proof: {
          data: "test-a",
          signature: "signed-test-a",
        },
      },
      {
        id: "B",
        amount: "5",
        price: "5",
        proof: {
          data: "test-b",
          signature: "signed-test-b",
        },
      },
      {
        id: "C",
        amount: "0",
        price: "5",
        proof: {
          data: "test-c",
          signature: "signed-test-c",
        },
      },
    ];
    await Promise.all(
      assets.map(async ({id, amount, price, proof}) =>
        instance.methods
          .put(id, amount, price, Date.now(), proof.data, proof.signature)
          .send({
            from: governor,
            gas: 6000000,
          })
      )
    );

    const middleBalance = await instance.methods.balance().call();
    const middleSize = await instance.methods.size().call();
    assert.equal(
      middleBalance,
      bn(startBalance).add(bn("45")).toString(),
      "Middle balance invalid"
    );
    assert.equal(middleSize, assets.length.toString(), "Middle size invalid");

    const [removedAsset, updatedAsset] = assets;
    await instance.methods
      .remove(removedAsset.id)
      .send({from: governor, gas: 6000000});
    await instance.methods
      .put(
        updatedAsset.id,
        bn(updatedAsset.amount).add(bn(5)).toString(),
        updatedAsset.price,
        Date.now(),
        updatedAsset.proof.data,
        updatedAsset.proof.signature
      )
      .send({from: governor, gas: 6000000});

    const endBalance = await instance.methods.balance().call();
    const endSize = await instance.methods.size().call();
    assert.equal(
      endBalance,
      bn(middleBalance)
        .sub(bn(removedAsset.amount).mul(bn(removedAsset.price)))
        .add(bn(5).mul(bn(updatedAsset.price)))
        .toString(),
      "End balance invalid"
    );
    assert.equal(endSize, (assets.length - 1).toString(), "End size invalid");
  });
});
