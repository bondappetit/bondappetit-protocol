const {migration} = require("../../../utils/deploy");

module.exports = migration("Issuer", async (d) => {
  const [stable, treasury] = await d.deployed("StableToken", "Treasury");

  await d.deploy("Issuer", {
    args: [stable.address, treasury.address],
  });
});
