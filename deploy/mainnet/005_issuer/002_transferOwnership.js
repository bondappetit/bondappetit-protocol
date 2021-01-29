const {migration} = require("../../../utils/deploy");

module.exports = migration("Issuer.transferOwnership", async (d) => {
  const [issuer] = await d.deployed("Issuer");

  const currentOwner = await d.call("StableToken", "owner", []);
  if (currentOwner === issuer.address) {
    console.log(`Stable token owner already transfered to issuer contract`);
    return;
  }

  await d.send("StableToken", "transferOwnership", [issuer.address]);
});
