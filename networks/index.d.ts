export interface Named {
  name: string;
}

export interface Wallet {
  address: string;
}

export interface Account extends Named, Wallet {}

export interface Asset extends Named, Wallet {
  symbol: string;
  decimals: number;
  investing: boolean;
}

export interface Contract extends Named, Wallet {
  abi: any;
  voting: boolean;
}

export interface Config<T> {
  [name: string]: T;
}

export interface Network {
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
  "development-fork": Network;
  ropsten: Network;
  "ropsten-fork": Network;
  main: Network;
  "main-form": Network;
};

export = _exports;
