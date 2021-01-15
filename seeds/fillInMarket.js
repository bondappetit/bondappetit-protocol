const hardhat = require("hardhat");
const {development} = require("../networks");

async function main() {
  const governor = development.accounts.Governor.address;
  const amount = "1000000000000000000000";
  const {address: marketAddress} = await hardhat.deployments.get("Market");

  await hardhat.deployments.execute(
    "GovernanceToken",
    {from: governor},
    "mint",
    marketAddress,
    amount
  );
  await hardhat.deployments.execute(
    "StableToken",
    {from: governor},
    "mint",
    marketAddress,
    amount
  );

  const [govBalance, stableBalance] = await Promise.all([
    hardhat.deployments.read(
      "GovernanceToken",
      {from: governor},
      "balanceOf",
      marketAddress
    ),
    hardhat.deployments.read(
      "StableToken",
      {from: governor},
      "balanceOf",
      marketAddress
    ),
  ]);

  console.log(`Governance token balance: ${govBalance}`, `Stable token balance: ${stableBalance}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
