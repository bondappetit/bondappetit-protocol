const assertions = require("truffle-assertions");
const networks = require("../../networks");
const Investment = artifacts.require("Investment");
const IERC20 = artifacts.require("IERC20");

contract("OwnablePausable.pause", (accounts) => {
  const governor = networks.development.accounts.Governor.address;
  const pauser = accounts[1];

  it("changePauser: should change pauser address", async () => {
    const instance = await Investment.deployed();

    await assertions.reverts(
      instance.pause({from: pauser}),
      "OwnablePausable::pause: only pauser and owner must pause contract"
    );
    await assertions.reverts(
      instance.unpause({from: pauser}),
      "OwnablePausable::unpause: only pauser and owner must unpause contract"
    );

    await instance.changePauser(pauser, {from: governor});

    await instance.pause({from: pauser});
    await instance.unpause({from: pauser});
    await instance.pause({from: governor});
    await instance.unpause({from: governor});
  });
});
