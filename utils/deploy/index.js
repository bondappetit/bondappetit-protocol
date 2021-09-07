const networks = require("../../networks");
const {Web3, web3, network} = require("hardhat");

class Deployer {
  static GAS_LIMIT = 4000000;

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

  get isDev() {
    return this.network.networkName === "development";
  }

  getGovernor() {
    return this.network.accounts.Governor;
  }

  getSendOptions() {
    return {
      from: this.getGovernor().address,
      gasLimit: Deployer.GAS_LIMIT,
      gasPrice: network.config.gasPrice,
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

  async toTimelock(...contracts) {
    const [timelock] = await this.deployed("Timelock");
    if (!timelock) throw new Error("Timelock contract not deployed");

    return contracts.reduce(async (prev, contractName) => {
      await prev;
      await this.send(contractName, "transferOwnership", [timelock.address]);
    }, Promise.resolve());
  }

  async toValidator(...contracts) {
    const [validator] = await this.deployed("ProtocolValidator");
    if (!validator) throw new Error("ProtocolValidator contract not deployed");

    return contracts.reduce(async (prev, contractName) => {
      await prev;
      const [contract] = await this.deployed(contractName);
      if (!contract) throw new Error(`${contractName} contract not deployed`);
      await this.send(contractName, "changePauser", [validator.address]);
      await this.send("ProtocolValidator", "addProtocolContract", [
        contract.address,
      ]);
    }, Promise.resolve());
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

    const deployed = await deployments.getOrNull(contract);
    if (!deployed) return handler(d);

    console.log(`Already deployed: ${deployed.address}
`);
  };
}

const bn = Web3.utils.toBN.bind(Web3.utils);

module.exports = {
  Deployer,
  migration,
  bn,
};
