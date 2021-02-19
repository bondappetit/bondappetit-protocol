const hardhat = require("hardhat");
const Web3 = require("web3");
const {development} = require("../networks");
const dayjs = require("dayjs");

async function main() {
  const web3 = new Web3(hardhat.network.config.url);
  const governor = development.accounts.Governor.address;
  const {
    contracts: {Stable, Vesting, VestingSplitter},
    assets: {Governance},
  } = development;
  const gov = new web3.eth.Contract(Stable.abi, Governance.address);
  const vesting = new web3.eth.Contract(Vesting.abi, Vesting.address);
  const vestingSplitter = new web3.eth.Contract(
    VestingSplitter.abi,
    VestingSplitter.address
  );

  await gov.methods
    .approve(Vesting.address, "1000000000000000000")
    .send({from: governor, gas: 6000000});
  await vesting.methods
    .lock(VestingSplitter.address, "1000000000000000000", "now", dayjs().unix())
    .send({from: governor, gas: 6000000});

  await gov.methods
    .approve(Vesting.address, "5000000000000000000")
    .send({from: governor, gas: 6000000});
  await vesting.methods
    .lock(
      VestingSplitter.address,
      "5000000000000000000",
      "later",
      dayjs().add(30, "minutes").unix()
    )
    .send({from: governor, gas: 6000000});

  await vestingSplitter.methods
    .changeShares(
      [governor, "0x876A207aD9f6f0fA2C58A7902B2E7568a41c299f"],
      [80, 20]
    )
    .send({from: governor, gas: 6000000});
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
