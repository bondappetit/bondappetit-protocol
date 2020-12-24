const hardhat = require("hardhat");
const {development} = require("../networks");

async function main() {
  const governor = development.accounts.Governor.address;
  const amount = "1000000000000000000000";
  const {address: stackingAddress} = await hardhat.deployments.get("Stacking");

  await hardhat.deployments.execute(
    "Bond",
    {from: governor},
    "mint",
    stackingAddress,
    amount
  );

  const [bondBalance] = await Promise.all([
    hardhat.deployments.read(
      "Bond",
      {from: governor},
      "balanceOf",
      stackingAddress
    ),
  ]);

  console.log(`Bond balance: ${bondBalance}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
