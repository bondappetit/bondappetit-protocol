const assertions = require("truffle-assertions");
const {contract} = require("../../utils/test");

contract("OwnablePausable.pauseUnpause", ({web3, artifacts}) => {
  const network = artifacts.network;
  const governor = network.accounts.Governor.address;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const amount = "1";

  before(async () => {
    const gov = await artifacts.require("GovernanceToken");

    web3.eth.sendTransaction({
      from: governor,
      to: investor,
      value: `1${"0".repeat(18)}`,
    });
    await gov.methods.mint(investor, amount).send({from: governor});
  });

  it("pause: should pause contract", async () => {
    const [instance, gov, depositary] = await artifacts.requireAll(
      "CollateralMarket",
      "GovernanceToken",
      "StableTokenDepositaryBalanceView"
    );
    await instance.methods.allowToken(gov._address).send({from: governor});
    await depositary.methods.allowToken(gov._address).send({from: governor});

    await instance.methods.pause().send({from: governor});

    await gov.methods
      .approve(instance._address, amount)
      .send({from: investor, gas: 2000000});
    await assertions.reverts(
      instance.methods
        .buy(gov._address, amount)
        .send({from: investor, gas: 6000000}),
      "Pausable: paused"
    );
  });

  it("unpause: should unpause contract", async () => {
    const [instance, gov] = await artifacts.requireAll(
      "CollateralMarket",
      "GovernanceToken"
    );

    await instance.methods.unpause().send({from: governor});

    await instance.methods
      .buy(gov._address, amount)
      .send({from: investor, gas: 6000000});
  });
});
