const ganache = require("ganache-core");
const Web3 = require("web3");
const {network} = require("hardhat");
const {readFile} = require("fs").promises;
const assert = require("assert").strict;

class ArtifactList {
  constructor(web3, deployments) {
    this.web3 = web3;
    this.deployments = deployments;
    this.cache = new Map();
  }

  async require(contract) {
    if (!this.cache.has(contract)) {
      const path = `${this.deployments}/${contract}.json`;

      try {
        const json = await readFile(path);
        const {abi, address} = JSON.parse(json);

        this.cache.set(contract, new this.web3.eth.Contract(abi, address));
      } catch (e) {
        throw new Error(`Artifact "${contract}" not found in "${path}"`);
      }
    }

    return this.cache.get(contract);
  }

  async requireAll(...contracts) {
    return Promise.all(contracts.map((contract) => this.require(contract)));
  }
}

async function contract(name, test) {
  const web3 = new Web3(
    ganache.provider({
      fork: network.config.url,
      mnemonic: network.config.accounts.mnemonic,
      unlocked_accounts: network.config.accounts.unlocked,
    })
  );
  const artifacts = new ArtifactList(web3, `deployments/${network.name}`);

  describe(
    name,
    test.bind(null, {
      web3,
      artifacts,
    })
  );
}

const bn = Web3.utils.toBN.bind(Web3.utils);

module.exports = {
  assert,
  contract,
  bn,
};
