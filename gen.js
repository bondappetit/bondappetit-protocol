const fs = require("fs").promises;
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
  return fs.writeFile(
    path,
    "module.exports = " + JSON.stringify(data, null, 4)
  );
}

async function writeJson(path, data) {
  return fs.writeFile(path, JSON.stringify(data, null, 4));
}

(async (configPath, network, out) => {
  const config = JSON.parse(await fs.readFile(configPath));

  const [assets, contracts, abiContracts] = await Promise.all([
    (config.assets || []).reduce(
      async (assets, {path, key, name, symbol, decimals, investing}) => {
        const res = await assets;
        try {
          const {address} = await loadJson(path.replace("%network%", network));

          return [
            ...res,
            {
              key,
              name,
              address,
              symbol,
              decimals,
              investing,
            },
          ];
        } catch (e) {
          return res; // Use preset data if asset not deployed (see USDN token)
        }
      },
      Promise.resolve([])
    ),
    (config.contracts || []).reduce(
      async (contracts, {path, key, name, voting}) => {
        const res = await contracts;
        try {
          const {address, abi} = await loadJson(
            path.replace("%network%", network)
          );

          return [
            ...res,
            {
              key,
              address,
              name,
              abi,
              voting,
            },
          ];
        } catch (e) {
          return res; // use preset data if contract not deployed
        }
      },
      Promise.resolve([])
    ),
    Promise.all(
      (config.abi || []).map(async ({path}) => {
        const {contractName, abi} = await loadJson(path);

        return {contractName, abi};
      })
    ),
  ]);

  await Promise.all([
    writeJs(
      `${out}/contracts.js`,
      contracts.reduce(
        (result, {address, key, name, abi, voting}) => ({
          ...result,
          [key || name]: {
            address,
            name,
            voting,
            abi,
          },
        }),
        {}
      )
    ),
    ...abiContracts.map(({contractName: name, abi}) =>
      writeJson(`${abiPath}/${name}.json`, {abi})
    ),
    writeJs(
      `${out}/assets.js`,
      assets.reduce(
        (result, {address, key, name, symbol, decimals, investing}) => ({
          ...result,
          [key || symbol]: {
            address,
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
