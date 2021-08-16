const ganache = require("ganache-core");
const Web3 = require("web3");
const {network, deployments} = require("hardhat");
const {readFile} = require("fs").promises;
const assert = require("assert").strict;

class ArtifactList {
  constructor(web3, deployments, artifacts) {
    this.web3 = web3;
    this.deployments = deployments;
    this.artifacts = artifacts;
    this.cache = new Map();
    this.accounts = [];
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

  async deploy(name, args = [], options = {}) {
    const {bytecode, abi} = await deployments.getArtifact(name);
    return new this.web3.eth.Contract(abi)
      .deploy({
        data: bytecode,
        arguments: args,
      })
      .send(options);
  }

  async artifact(dir, contractFileName) {
    const path = `${this.artifacts}/${dir}/${contractFileName}.sol/${contractFileName}.json`;

    try {
      return JSON.parse(await readFile(path));
    } catch (e) {
      throw new Error(`Artifact "${contractFileName}" not found in "${path}"`);
    }
  }

  async new(dir, contractFileName, name, args, options = {}) {
    const {abi, bytecode} = await this.artifact(dir, contractFileName);

    try {
      let contract = new this.web3.eth.Contract(abi);
      contract = await contract
        .deploy({
          data: bytecode,
          arguments: args,
        })
        .send(options);
      this.cache.set(name, contract);
      return contract;
    } catch (e) {
      throw new Error(`Contract "${contract}" not deployed with error: ${e}`);
    }
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
  const artifacts = new ArtifactList(
    web3,
    `deployments/${network.name}`,
    "artifacts"
  );

  before(async () => {
    artifacts.accounts = await web3.eth.getAccounts();
  });

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
