// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./YieldEscrow.sol";
import "./GovernanceToken.sol";

contract VoteDelegator is Ownable {
    using SafeERC20 for ERC20;

    /// @notice Yield escrow contract address.
    address public yieldEscrow;

    /**
     * @param _owner Owner account address.
     */
    constructor(address _owner) public {
        yieldEscrow = _msgSender();
        if (yieldEscrow != _owner) transferOwnership(_owner);
        GovernanceToken(governanceToken()).delegate(owner());
    }

    /**
     * @notice Destroy contract and transfer governance token to voting escrow.
     */
    function destroy() external {
        require(_msgSender() == yieldEscrow, "VoteDelegator::destroy: caller is not the voting escrow");

        ERC20 gov = ERC20(governanceToken());
        uint256 balance = gov.balanceOf(address(this));
        if (balance > 0) {
            gov.safeTransfer(yieldEscrow, balance);
        }
        selfdestruct(payable(owner()));
    }

    /**
     * @return Governance token contract address.
     */
    function governanceToken() public view returns (address) {
        return YieldEscrow(yieldEscrow).governanceToken();
    }

    /**
     * @notice Deposit governance token.
     * @param amount Deposit amount.
     */
    function deposit(uint256 amount) external onlyOwner {
        address account = owner();
        ERC20(governanceToken()).safeTransferFrom(account, address(this), amount);
        YieldEscrow(yieldEscrow).depositFromDelegator(account, amount);
    }

    /**
     * @notice Withdraw governance token.
     * @param amount Withdraw amount.
     */
    function withdraw(uint256 amount) external onlyOwner {
        address account = owner();
        YieldEscrow(yieldEscrow).withdrawFromDelegator(account, amount);
        ERC20(governanceToken()).safeTransfer(account, amount);
    }
}
