const fs = require("fs").promises;
const truffleConfig = require("./truffle-config");
const cla = require("command-line-args");

const {config, network, out, abi: abiPath} = cla([
  {name: "network", alias: "n", type: String, defaultValue: "development"},
  {name: "config", alias: "c", type: String, defaultValue: "gen.config.json"},
  {name: "out", alias: "o", type: String, defaultValue: "gen"},
  {name: "abi", alias: "a", type: String, defaultValue: "abi"},
]);

async function loadJson(path) {
  return JSON.parse(await fs.readFile(path));
}

async function writeJs(path, data) {
  return fs.writeFile(path, 'module.exports = ' + JSON.stringify(data, null, 4));
}

async function writeJson(path, data) {
  return fs.writeFile(path, JSON.stringify(data, null, 4));
}

(async (configPath, network, out) => {
  const networkId = truffleConfig.networks[network].network_id;
  const config = JSON.parse(await fs.readFile(configPath));

  const [assets, contracts, abiContracts] = await Promise.all([
    Promise.all(
      (config.assets || []).map(async ({path, symbol, decimals, investing}) => ({
        ...(await loadJson(path)),
        symbol,
        decimals,
        investing,
      }))
    ),
    Promise.all((config.contracts || []).map(({path}) => loadJson(path))),
    Promise.all((config.abi || []).map(({path}) => loadJson(path))),
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
    ...abiContracts.map(({contractName: name, abi}) => writeJson(
      `${abiPath}/${name}.json`,
      { abi }
    )),
    writeJs(
      `${out}/assets.js`,
      assets.reduce(
        (result, {contractName: name, symbol, decimals, investing, networks}) => ({
          ...result,
          [name]: {
            address: networks[networkId].address,
            name,
            symbol,
            decimals,
            investing,
          },
        }),
        {}
      )
    ),
  ]);
})(config, network, out);
