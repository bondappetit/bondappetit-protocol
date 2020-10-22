module.exports = {
  accounts: {
    ...require("./accounts"),
  },
  assets: {
    ...require("./assets"),
    ...require("./gen/assets"),
  },
  contracts: {
    ...require("./contracts"),
    ...require("./gen/contracts"),
  },
};
