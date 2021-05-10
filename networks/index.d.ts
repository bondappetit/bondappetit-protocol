interface Named {
  name: string;
}

interface Wallet {
  address: string;
}

interface Account extends Named, Wallet {}

interface Asset extends Named, Wallet {
  symbol: string;
  decimals: number;
  investing: boolean;
}

interface Contract extends Named, Wallet {
  abi: any;
  voting: boolean;
}

interface Config<T> {
  [name: string]: T;
}

interface Network {
  networkName: string;
  networkUrl: string;
  networkEtherscan: string;
  networkId: number;
  gasPrice: string;
  averageBlockTime: string;
  accounts: Config<Account>;
  assets: Config<Asset>;
  contracts: Config<Contract>;
}

declare const _exports: {
  development: Network;
  ropsten: Network;
  testnetBSC: Network;
  main: Network;
  mainBSC: Network;
};

export = _exports;
