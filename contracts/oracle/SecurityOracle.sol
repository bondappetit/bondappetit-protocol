// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ISecurityOracle.sol";

contract SecurityOracle is ISecurityOracle, Ownable {
    /// @dev Data of security properties.
    mapping(string => mapping(string => bytes)) private data;

    function put(
        string memory isin,
        string memory prop,
        bytes memory value
    ) external override onlyOwner {
        data[isin][prop] = value;
        emit Update(isin, prop, value);
    }

    function get(string memory isin, string memory prop) external override view returns (bytes memory) {
        return data[isin][prop];
    }
}
