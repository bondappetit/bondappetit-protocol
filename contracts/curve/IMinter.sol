// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface IMinter {
    function token() external view returns (address);

    function minted(address recipient, address gauge) external view returns (uint256);

    function mint(address gauge_addr) external;
}
