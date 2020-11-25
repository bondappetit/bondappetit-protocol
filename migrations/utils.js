function delay(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

async function afterMigration(network) {
  if (!["development", "development-fork"].includes(network)) {
    await delay(15000);
  }
}

module.exports = {
  delay,
  afterMigration,
};
