const networks = require("../../networks");
const web3 = require("web3");

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

  start(name) {
    console.log(
      `${name}
============
`
    );
  }

  async _addCost(gas) {
    this.totalCost = web3.utils
      .toBN(this.totalCost)
      .add(
        web3.utils.toBN(gas).mul(web3.utils.toBN(this.getNetwork().gasPrice))
      )
      .toString();
  }

  async deploy(contract, options = {}) {
    console.log(`=== Deploying "${contract}(${(options.args || []).join(", ")})" ===`);
    const tx = await this.deployments.deploy(contract, {
      from: this.getGovernor().address,
      gasLimit: Deployer.GAS_LIMIT,
      ...options,
    });
    await this._addCost(tx.receipt.gasUsed.toString());

    console.log(`> transaction hash: ${tx.transactionHash}
> contract address: ${tx.address}
> block number: ${tx.receipt.blockNumber}
> account: ${tx.receipt.from}
> gas used: ${tx.receipt.gasUsed.toString()}
> total cost: ${web3.utils.fromWei(this.totalCost, "ether")} ETH
`);

    return tx;
  }

  async fetchIfDifferent(contract, options = {}) {
    return this.deployments.fetchIfDifferent(contract, {
      from: this.getGovernor().address,
      gasLimit: Deployer.GAS_LIMIT,
      ...options,
    });
  }

  async deployed(...contracts) {
    return Promise.all(
      contracts.map((contract) => this.deployments.get(contract))
    );
  }

  async call(contract, methods, args, options = {}) {
    return this.deployments.read(contract, options, methods, ...args);
  }

  async send(contract, method, args, options = {}) {
    console.log(`=== Send "${contract}.${method}(${args.join(", ")})" ===`);
    const tx = await this.deployments.execute(
      contract,
      {
        from: this.getGovernor().address,
        gasLimit: Deployer.GAS_LIMIT,
        ...options,
      },
      method,
      ...args
    );
    await this._addCost(tx.gasUsed.toString());

    console.log(`> transaction hash: ${tx.transactionHash}
> to: ${tx.to}
> block number: ${tx.blockNumber}
> account: ${tx.from}
> gas used: ${tx.gasUsed.toString()}
> total cost: ${web3.utils.fromWei(this.totalCost, "ether")} ETH
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
