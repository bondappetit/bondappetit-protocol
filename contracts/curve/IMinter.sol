// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface IMinter {
    function token() external view returns (address);

    function mint(address gauge_addr) external;
}
