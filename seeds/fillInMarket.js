const hardhat = require("hardhat");
const {development} = require("../networks");

async function main() {
  const governor = development.accounts.Governor.address;
  const amount = "1000000000000000000000";
  const {address: marketAddress} = await hardhat.deployments.get("Market");

  await hardhat.deployments.execute(
    "Bond",
    {from: governor},
    "mint",
    marketAddress,
    amount
  );
  await hardhat.deployments.execute(
    "ABT",
    {from: governor},
    "mint",
    marketAddress,
    amount
  );

  const [bondBalance, abtBalance] = await Promise.all([
    hardhat.deployments.read(
      "Bond",
      {from: governor},
      "balanceOf",
      marketAddress
    ),
    hardhat.deployments.read(
      "ABT",
      {from: governor},
      "balanceOf",
      marketAddress
    ),
  ]);

  console.log(`Bond balance: ${bondBalance}`, `ABT balance: ${abtBalance}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
