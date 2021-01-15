const assertions = require("truffle-assertions");
const {contract} = require("../../utils/test");
const {development} = require("../../networks");

contract("OwnablePausable.pause", ({web3, artifacts}) => {
  const governor = development.accounts.Governor.address;

  it("changePauser: should change pauser address", async () => {
    const instance = await artifacts.require("Investment");
    const [, pauser] = artifacts.accounts;

    await assertions.reverts(
      instance.methods.pause().send({from: pauser}),
      "OwnablePausable::pause: only pauser and owner must pause contract"
    );
    await assertions.reverts(
      instance.methods.unpause().send({from: pauser}),
      "OwnablePausable::unpause: only pauser and owner must unpause contract"
    );

    await instance.methods.changePauser(pauser).send({from: governor});

    await instance.methods.pause().send({from: pauser});
    await instance.methods.unpause().send({from: pauser});
    await instance.methods.pause().send({from: governor});
    await instance.methods.unpause().send({from: governor});
  });
});
