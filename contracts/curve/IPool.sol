// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface IPool {
    function coins(uint256 i) external view returns (address);

    function add_liquidity(uint256[3] memory _deposit_amounts, uint256 _min_mint_amount) external;

    function remove_liquidity_one_coin(
        uint256 _burn_amount,
        int128 i,
        uint256 _min_received
    ) external;
}
