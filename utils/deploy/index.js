const networks = require("../../networks");
const {Web3, web3} = require("hardhat");

class Deployer {
  static GAS_LIMIT = 6000000;

  static instance;

  static getInstance(deployments, chainId) {
    if (!Deployer.instance) {
      Deployer.instance = new Deployer(deployments, chainId);
    }

    return Deployer.instance;
  }

  constructor(deployments, chainId) {
    this.deployments = deployments;
    this.chainId = chainId;
    this.network = Object.values(networks).find(
      ({networkId}) => networkId.toString() === this.chainId
    );
    if (!this.network) {
      throw new Error(`Network configuration for "${chainId}" not found`);
    }
    this.web3 = web3;
    this.totalCost = 0;

    console.log(
      `Network name: ${this.network.networkName}
Network id: ${this.network.networkId}
`
    );
  }

  getNetwork() {
    return this.network;
  }

  getGovernor() {
    return this.network.accounts.Governor;
  }

  getSendOptions() {
    return {
      from: this.getGovernor().address,
      gasLimit: Deployer.GAS_LIMIT,
    };
  }

  start(name) {
    console.log(
      `${name}
============
`
    );
  }

  async _addCost(gas) {
    const bn = Web3.utils.toBN.bind(Web3.utils);
    this.totalCost = bn(this.totalCost)
      .add(bn(gas).mul(bn(this.getNetwork().gasPrice)))
      .toString();
  }

  async deploy(contract, options = {}) {
    console.log(
      `=== Deploying "${contract}(${(options.args || []).join(", ")})" ===`
    );
    const tx = await this.deployments.deploy(contract, {
      ...this.getSendOptions(),
      ...options,
    });
    await this._addCost(tx.receipt.gasUsed.toString());

    console.log(`> transaction hash: ${tx.transactionHash}
> contract address: ${tx.address}
> block number: ${tx.receipt.blockNumber}
> account: ${tx.receipt.from}
> gas used: ${tx.receipt.gasUsed.toString()}
> total cost: ${Web3.utils.fromWei(this.totalCost, "ether")} ETH
`);

    return tx;
  }

  async fetchIfDifferent(contract, options = {}) {
    return this.deployments.fetchIfDifferent(contract, {
      ...this.getSendOptions(),
      ...options,
    });
  }

  async deployed(...contracts) {
    return Promise.all(
      contracts.map((contract) => this.deployments.get(contract))
    );
  }

  async contract(...contracts) {
    const networkContracts = this.getNetwork().contracts;

    return contracts.map(
      (contractName) =>
        new this.web3.eth.Contract(
          networkContracts[contractName].abi,
          networkContracts[contractName].address
        )
    );
  }

  async call(contractName, method, args, options = {}) {
    if (contractName[0] === "@") {
      const [contract] = await this.contract(contractName.slice(1));
      return contract.methods[method](...args).call(options);
    } else {
      return this.deployments.read(contractName, options, method, ...args);
    }
  }

  async send(contractName, method, args, options = {}) {
    console.log(`=== Send "${contractName}.${method}(${args.join(", ")})" ===`);
    let tx;
    if (contractName[0] === "@") {
      const [contract] = await this.contract(contractName.slice(1));
      tx = await contract.methods[method](...args).send({
        ...this.getSendOptions(),
        ...options,
      });
    } else {
      tx = await this.deployments.execute(
        contractName,
        {
          ...this.getSendOptions(),
          ...options,
        },
        method,
        ...args
      );
    }
    await this._addCost(tx.gasUsed.toString());

    console.log(`> transaction hash: ${tx.transactionHash}
> to: ${tx.to}
> block number: ${tx.blockNumber}
> account: ${tx.from}
> gas used: ${tx.gasUsed.toString()}
> total cost: ${Web3.utils.fromWei(this.totalCost, "ether")} ETH
`);

    return tx;
  }
}

function migration(contract, handler) {
  return async function ({deployments, getChainId}) {
    const d = Deployer.getInstance(deployments, await getChainId());
    d.start(contract);

    const {differences, address} = await d.fetchIfDifferent(contract);
    if (differences) return handler(d);

    console.log(`Already deployed: ${address}
`);
  };
}

module.exports = {
  Deployer,
  migration,
};
