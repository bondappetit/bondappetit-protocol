const fs = require("fs").promises;
const truffleConfig = require("./truffle-config");
const cla = require("command-line-args");

const {config, network, out} = cla([
  {name: "network", alias: "n", type: String, defaultValue: "development"},
  {name: "config", alias: "c", type: String, defaultValue: "gen.config.json"},
  {name: "out", alias: "o", type: String, defaultValue: "gen"},
]);

async function loadJson(path) {
  return JSON.parse(await fs.readFile(path));
}

async function writeJs(path, data) {
  return fs.writeFile(path, 'module.exports = ' + JSON.stringify(data, null, 4));
}

(async (configPath, network, out) => {
  const networkId = truffleConfig.networks[network].network_id;
  const config = JSON.parse(await fs.readFile(configPath));

  const [assets, contracts] = await Promise.all([
    Promise.all(
      (config.assets || []).map(async ({path, symbol, decimals}) => ({
        ...(await loadJson(path)),
        symbol,
        decimals,
      }))
    ),
    Promise.all((config.contracts || []).map(({path}) => loadJson(path))),
  ]);

  await Promise.all([
    writeJs(
      `${out}/contracts.js`,
      contracts.reduce(
        (result, {contractName: name, abi, networks}) => ({
          ...result,
          [name]: {
            address: networks[networkId].address,
            name,
            abi,
          },
        }),
        {}
      )
    ),
    writeJs(
      `${out}/assets.js`,
      assets.reduce(
        (result, {contractName: name, symbol, decimals, networks}) => ({
          ...result,
          [name]: {
            address: networks[networkId].address,
            name,
            symbol,
            decimals,
          },
        }),
        {}
      )
    ),
  ]);
})(config, network, out);
