const assertions = require("truffle-assertions");
const networks = require("../../networks");
const Investment = artifacts.require("Investment");
const IERC20 = artifacts.require("IERC20");

contract("OwnablePausable.pause", (accounts) => {
  const {USDC} = networks.development.assets;
  const governor = networks.development.accounts.Governor.address;
  const investor = "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f";
  const usdcContract = new web3.eth.Contract(IERC20.abi, USDC.address);
  const amountIn = "1";

  it("pause: should pause contract", async () => {
    const instance = await Investment.deployed();

    await instance.pause({from: governor});

    await usdcContract.methods
      .approve(Investment.address, amountIn)
      .send({from: investor, gas: 2000000});
    await assertions.reverts(
      instance.invest(USDC.address, amountIn, {
        from: investor,
        gas: 2000000,
      }),
      "Pausable: paused"
    );
  });

  it("unpause: should unpause contract", async () => {
    const instance = await Investment.deployed();

    await instance.unpause({from: governor});

    await instance.invest(USDC.address, amountIn, {
      from: investor,
      gas: 2000000,
    });
  });
});
