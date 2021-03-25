// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface IRegistry {
    function get_lp_token(address pool) external view returns (address);

    function get_gauges(address pool) external view returns (address[10] memory, int128[10] memory);
}
