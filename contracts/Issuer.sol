// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./oracle/AgregateDepositaryBalanceView.sol";
import "./ABT.sol";

contract Issuer is AgregateDepositaryBalanceView {
    using SafeMath for uint256;

    /// @notice ABT contract address.
    ABT public abt;

    /// @notice Treasury contract address.
    address public treasury;

    /// @notice An event thats emitted when an Treasury contract transfered.
    event TransferTreasury(address newTreasury);

    /// @notice An event thats emitted when an ABT total supply rebalanced.
    event Rebalance();

    /**
     * @param _abt ABT contract address.
     * @param _treasury Treasury contract address.
     */
    constructor(address _abt, address _treasury) public AgregateDepositaryBalanceView(ABT(_abt).decimals(), 50) {
        abt = ABT(_abt);
        treasury = _treasury;
    }

    /**
     * @notice Transfer Treasury contract to new address.
     * @param _treasury New address Treasury contract.
     */
    function changeTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit TransferTreasury(treasury);
    }

    /**
     * @notice Rebalance ABT total supply by depositary balance. Mint ABT tokens if depositary balance greater token total supply and burn otherwise.
     */
    function rebalance() external whenNotPaused {
        uint256 currentDepositaryBalance = this.balance();
        uint256 burningBalance = abt.balanceOf(address(this));
        uint256 abtTotalSupply = abt.totalSupply();

        if (abtTotalSupply > currentDepositaryBalance && burningBalance > 0) {
            abt.burn(address(this), burningBalance);
            emit Rebalance();

            abtTotalSupply = abt.totalSupply();
        }
        if (abtTotalSupply < currentDepositaryBalance) {
            abt.mint(treasury, currentDepositaryBalance.sub(abtTotalSupply));
            emit Rebalance();
        }
    }
}
