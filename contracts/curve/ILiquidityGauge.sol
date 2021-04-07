// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface ILiquidityGauge {
    function minter() external view returns (address);

    function crv_token() external view returns (address);

    function claimable_tokens(address recipient) external returns (uint256);

    function deposit(uint256 amount) external;

    function withdraw(uint256 amount) external;
}
