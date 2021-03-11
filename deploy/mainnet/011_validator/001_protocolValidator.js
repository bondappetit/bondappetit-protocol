const {migration} = require("../../../utils/deploy");

module.exports = migration("ProtocolValidator", async (d) => {
  await d.deploy("ProtocolValidator", {
    args: [50],
  });
});
