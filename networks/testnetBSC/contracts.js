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
    address: "0xd99d1c33f9fc3444f8101754abc46c52416550d1",
    name: "PancakeRouter",
    voting: false,
    abi: [
      {
        inputs: [],
        name: "factory",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "pure",
        type: "function",
      },
      {
        inputs: [],
        name: "WETH",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "pure",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "tokenA",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenB",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountADesired",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountBDesired",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountAMin",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountBMin",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "addLiquidity",
        outputs: [
          {
            internalType: "uint256",
            name: "amountA",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountB",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountTokenDesired",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountTokenMin",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountETHMin",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "addLiquidityETH",
        outputs: [
          {
            internalType: "uint256",
            name: "amountToken",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountETH",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "tokenA",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenB",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountAMin",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountBMin",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "removeLiquidity",
        outputs: [
          {
            internalType: "uint256",
            name: "amountA",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountB",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountTokenMin",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountETHMin",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "removeLiquidityETH",
        outputs: [
          {
            internalType: "uint256",
            name: "amountToken",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountETH",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "tokenA",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenB",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountAMin",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountBMin",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "approveMax",
            type: "bool",
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8",
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
        ],
        name: "removeLiquidityWithPermit",
        outputs: [
          {
            internalType: "uint256",
            name: "amountA",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountB",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountTokenMin",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountETHMin",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "approveMax",
            type: "bool",
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8",
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
        ],
        name: "removeLiquidityETHWithPermit",
        outputs: [
          {
            internalType: "uint256",
            name: "amountToken",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountETH",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountOutMin",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "swapExactTokensForTokens",
        outputs: [
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountInMax",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "swapTokensForExactTokens",
        outputs: [
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountOutMin",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "swapExactETHForTokens",
        outputs: [
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountInMax",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "swapTokensForExactETH",
        outputs: [
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountOutMin",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "swapExactTokensForETH",
        outputs: [
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "swapETHForExactTokens",
        outputs: [
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountA",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveA",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveB",
            type: "uint256",
          },
        ],
        name: "quote",
        outputs: [
          {
            internalType: "uint256",
            name: "amountB",
            type: "uint256",
          },
        ],
        stateMutability: "pure",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveIn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveOut",
            type: "uint256",
          },
        ],
        name: "getAmountOut",
        outputs: [
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
        ],
        stateMutability: "pure",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveIn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveOut",
            type: "uint256",
          },
        ],
        name: "getAmountIn",
        outputs: [
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
        ],
        stateMutability: "pure",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
        ],
        name: "getAmountsOut",
        outputs: [
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
        ],
        name: "getAmountsIn",
        outputs: [
          {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountTokenMin",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountETHMin",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "removeLiquidityETHSupportingFeeOnTransferTokens",
        outputs: [
          {
            internalType: "uint256",
            name: "amountETH",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountTokenMin",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountETHMin",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "approveMax",
            type: "bool",
          },
          {
            internalType: "uint8",
            name: "v",
            type: "uint8",
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
        ],
        name: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
        outputs: [
          {
            internalType: "uint256",
            name: "amountETH",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountOutMin",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountOutMin",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountOutMin",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "path",
            type: "address[]",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  },
  UniswapV2Factory: {
    address: "0x6725f303b657a9451d8ba641348b6761a6cc7a17",
    name: "PancakeFactory",
    voting: false,
    abi: [
      {
        inputs: [
          {internalType: "address", name: "_feeToSetter", type: "address"},
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "token0",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "token1",
            type: "address",
          },
          {
            indexed: false,
            internalType: "address",
            name: "pair",
            type: "address",
          },
          {indexed: false, internalType: "uint256", name: "", type: "uint256"},
        ],
        name: "PairCreated",
        type: "event",
      },
      {
        constant: true,
        inputs: [{internalType: "uint256", name: "", type: "uint256"}],
        name: "allPairs",
        outputs: [{internalType: "address", name: "", type: "address"}],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "allPairsLength",
        outputs: [{internalType: "uint256", name: "", type: "uint256"}],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {internalType: "address", name: "tokenA", type: "address"},
          {internalType: "address", name: "tokenB", type: "address"},
        ],
        name: "createPair",
        outputs: [{internalType: "address", name: "pair", type: "address"}],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "feeTo",
        outputs: [{internalType: "address", name: "", type: "address"}],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "feeToSetter",
        outputs: [{internalType: "address", name: "", type: "address"}],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {internalType: "address", name: "", type: "address"},
          {internalType: "address", name: "", type: "address"},
        ],
        name: "getPair",
        outputs: [{internalType: "address", name: "", type: "address"}],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [{internalType: "address", name: "_feeTo", type: "address"}],
        name: "setFeeTo",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {internalType: "address", name: "_feeToSetter", type: "address"},
        ],
        name: "setFeeToSetter",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  },
  UsdtUsdPriceFeed: {
    address: "0xeca2605f0bcf2ba5966372c99837b1f182d3d620",
    name: "UsdtUsdPriceFeed",
    voting: false,
    abi: [
      {
        inputs: [
          {
            internalType: "uint8",
            name: "_decimals",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "_version",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        name: "addRound",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [
          {
            internalType: "uint8",
            name: "",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "_roundId",
            type: "uint80",
          },
        ],
        name: "getRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundId",
        outputs: [
          {
            internalType: "uint80",
            name: "",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "version",
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
  UsdcUsdPriceFeed: {
    address: "0x90c069c4538adac136e051052e14c1cd799c41b7",
    name: "UsdcUsdPriceFeed",
    voting: false,
    abi: [
      {
        inputs: [
          {
            internalType: "uint8",
            name: "_decimals",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "_version",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        name: "addRound",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [
          {
            internalType: "uint8",
            name: "",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "_roundId",
            type: "uint80",
          },
        ],
        name: "getRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundId",
        outputs: [
          {
            internalType: "uint80",
            name: "",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "version",
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
  DaiBnbPriceFeed: {
    address: "0x0630521ac362bc7a19a4ee44b57ce72ea34ad01c",
    name: "DaiBnbPriceFeed",
    voting: false,
    abi: [
      {
        inputs: [
          {
            internalType: "uint8",
            name: "_decimals",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "_version",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        name: "addRound",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [
          {
            internalType: "uint8",
            name: "",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "_roundId",
            type: "uint80",
          },
        ],
        name: "getRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundId",
        outputs: [
          {
            internalType: "uint80",
            name: "",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "version",
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
  BnbUsdPriceFeed: {
    address: "0x2514895c72f50d8bd4b4f9b1110f0d6bd2c97526",
    name: "BnbUsdPriceFeed",
    voting: false,
    abi: [
      {
        inputs: [
          {
            internalType: "uint8",
            name: "_decimals",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "_version",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        name: "addRound",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [
          {
            internalType: "uint8",
            name: "",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "_roundId",
            type: "uint80",
          },
        ],
        name: "getRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundId",
        outputs: [
          {
            internalType: "uint80",
            name: "",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "version",
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
  BtcUsdPriceFeed: {
    address: "0x5741306c21795fdcbb9b265ea0255f499dfe515c",
    name: "BtcUsdPriceFeed",
    voting: false,
    abi: [
      {
        inputs: [
          {
            internalType: "uint8",
            name: "_decimals",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "_version",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        name: "addRound",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [
          {
            internalType: "uint8",
            name: "",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "_roundId",
            type: "uint80",
          },
        ],
        name: "getRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundId",
        outputs: [
          {
            internalType: "uint80",
            name: "",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "version",
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
  EthUsdPriceFeed: {
    address: "0x143db3ceefbdfe5631add3e50f7614b6ba708ba7",
    name: "EthUsdPriceFeed",
    voting: false,
    abi: [
      {
        inputs: [
          {
            internalType: "uint8",
            name: "_decimals",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "_version",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        name: "addRound",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [
          {
            internalType: "uint8",
            name: "",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint80",
            name: "_roundId",
            type: "uint80",
          },
        ],
        name: "getRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          {
            internalType: "uint80",
            name: "roundId",
            type: "uint80",
          },
          {
            internalType: "int256",
            name: "answer",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "startedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "updatedAt",
            type: "uint256",
          },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundId",
        outputs: [
          {
            internalType: "uint80",
            name: "",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "version",
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
};
