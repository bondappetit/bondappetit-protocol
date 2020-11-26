module.exports = {
  UniswapAnchoredView: {
    address: "0xbef4e076a995c784be6094a432b9ca99b7431a3f",
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
