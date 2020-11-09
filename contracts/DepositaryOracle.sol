// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DepositaryOracle is Ownable {
    using SafeMath for uint256;

    /// @notice Delay blocks count.
    uint256 public delay;

    /// @notice Oracle value.
    string public data;

    /// @notice Last update block number.
    uint256 public lastUpdate;

    /// @dev Allow update oracle data for all accounts.
    bool internal allowUpdateAll;

    /// @dev Update oracle permissions.
    mapping(address => bool) internal allowUpdate;

    /**
     * @param _delay Delay blocks count.
     * @param _allowUpdateAll Allow update oracle data for all accounts.
     */
    constructor(uint256 _delay, bool _allowUpdateAll) public {
        delay = _delay;
        allowUpdateAll = _allowUpdateAll;
    }

    /**
     * @param _delay Delay blocks count.
     */
    function setDelay(uint256 _delay) external onlyOwner {
        delay = _delay;
    }

    /**
     * @return Number next update block.
     */
    function nextUpdate() public view returns (uint256) {
        return lastUpdate.add(delay);
    }

    /**
     * @param _allowUpdateAll Is allow update oracle data for all accounts.
     */
    function setAllowUpdateAll(bool _allowUpdateAll) external onlyOwner {
        allowUpdateAll = _allowUpdateAll;
    }

    /**
     * @param account Target account.
     * @param _allowUpdate Is allow update oracle data for target account.
     */
    function setAllowUpdateAccount(address account, bool _allowUpdate) external onlyOwner {
        allowUpdate[account] = _allowUpdate;
    }

    /**
     * @param account Target account address.
     * @return Account can update oracle data.
     */
    function isUpdateAllowed(address account) public view returns(bool) {
        return allowUpdateAll || allowUpdate[account];
    }

    /**
     * @param _data Verifiable data.
     * @return Is data update.
     */
    function isDataEquals(string memory _data) public view returns (bool) {
        return bytes(data).length == bytes(_data).length && keccak256(abi.encodePacked(data)) == keccak256(abi.encodePacked(_data));
    }

    /**
     * @param _data New oracle value.
     * @param _lastUpdate Last update block number.
     */
    function update(string memory _data, uint256 _lastUpdate) external {
        require(isUpdateAllowed(_msgSender()), "DepositaryOracle::update: access denied");
        require(!isDataEquals(_data), "DepositaryOracle::update: data not updated");
        require(_lastUpdate == lastUpdate, "DepositaryOracle::update: outdated");
        require(block.number >= nextUpdate(), "DepositaryOracle::update: early");

        data = _data;
        lastUpdate = block.number;
    }
}
