module.exports = {
  UniswapAnchoredView: {
    address: "0x922018674c12a7F0D394ebEEf9B58F186CdE13c1",
    name: "UniswapAnchoredView",
    voting: false,
    abi: [
      {
        inputs: [
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
        ],
        name: "price",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
  },
  UniswapV2Router02: {
    address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    name: "UniswapV2Router02",
    voting: false,
    abi: [],
  },
};
