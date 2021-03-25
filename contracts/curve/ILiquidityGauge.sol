// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface ILiquidityGauge {
    function deposit(uint256 amount) external;

    function withdraw(uint256 amount) external;
}
