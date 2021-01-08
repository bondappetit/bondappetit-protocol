const assertions = require("truffle-assertions");
const {development} = require("../../networks");
const {contract} = require("../../utils/test");

contract("OwnablePausable.pause", ({web3, artifacts}) => {
  const {USDC} = development.assets;
  const governor = development.accounts.Governor.address;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const usdcContract = new web3.eth.Contract(
    development.contracts.Stable.abi,
    USDC.address
  );
  const amountIn = "1";

  it("pause: should pause contract", async () => {
    const instance = await artifacts.require("Investment");

    await instance.methods.pause().send({from: governor});

    await usdcContract.methods
      .approve(instance._address, amountIn)
      .send({from: investor, gas: 2000000});
    await assertions.reverts(
      instance.methods.invest(USDC.address, amountIn).send({
        from: investor,
        gas: 2000000,
      }),
      "Pausable: paused"
    );
  });

  it("unpause: should unpause contract", async () => {
    const instance = await artifacts.require("Investment");

    await instance.methods.unpause().send({from: governor});

    await instance.methods.invest(USDC.address, amountIn).send({
      from: investor,
      gas: 2000000,
    });
  });
});
