// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./VoteDelegator.sol";

contract YieldEscrow is Ownable, ERC20 {
    using SafeERC20 for ERC20;

    /// @notice Governance token contract.
    address public governanceToken;

    /// @dev Created vote delegators by account.
    mapping(address => address) internal _voteDelegators;

    event VoteDelegatorCreated(address indexed account, address voteDelegator);

    event VoteDelegatorDestroyed(address indexed account);

    event Deposit(address indexed account, uint256 amount);

    event Withdraw(address indexed account, uint256 amount);

    /**
     * @param _governanceToken Governance token contract address.
     */
    constructor(address _governanceToken) public ERC20("BondAppetit Governance yield", "yBAG") {
        governanceToken = _governanceToken;
    }

    /**
     * @param account Target account.
     * @return Address of vote delegator (zero if not delegate).
     */
    function voteDelegatorOf(address account) public view returns (address) {
        return _voteDelegators[account];
    }

    /**
     * @notice Create vote delegator contract for sender account.
     * @return Address of vote delegator.
     */
    function createVoteDelegator() external returns (address) {
        address account = _msgSender();
        require(voteDelegatorOf(account) == address(0), "YieldEscrow::createVoteDelegator: votes delegator already created");

        _voteDelegators[account] = address(new VoteDelegator(account));
        uint256 balance = balanceOf(account);
        if (balance > 0) {
            ERC20(governanceToken).safeTransfer(voteDelegatorOf(account), balance);
        }
        emit VoteDelegatorCreated(account, voteDelegatorOf(account));

        return voteDelegatorOf(account);
    }

    /**
     * @notice Destroy vote delegator contract for sender account.
     */
    function destroyVoteDelegator() external {
        address account = _msgSender();
        address voteDelegator = voteDelegatorOf(account);
        require(voteDelegator != address(0), "VotinEscrow::destroyVoteDelegator: votes delegator already destroyed");

        _voteDelegators[account] = address(0);
        VoteDelegator(voteDelegator).destroy();
        emit VoteDelegatorDestroyed(account);
    }

    /**
     * @notice Deposit governance token.
     * @param amount Deposit amount.
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "YieldEscrow::deposit: negative or zero amount");
        address account = _msgSender();
        require(voteDelegatorOf(account) == address(0), "YieldEscrow::deposit: vote delegator only deposit for this account");

        ERC20(governanceToken).safeTransferFrom(account, address(this), amount);
        _mint(account, amount);
        emit Deposit(account, amount);
    }

    /**
     * @notice Deposit governance token from vote delegator only.
     * @param account Target account.
     * @param amount Deposit amount.
     */
    function depositFromDelegator(address account, uint256 amount) external {
        require(amount > 0, "YieldEscrow::depositFromDelegator: negative or zero amount");
        require(_msgSender() == voteDelegatorOf(account), "YieldEscrow::depositFromDelegator: caller is not a vote delegator");

        _mint(account, amount);
        emit Deposit(account, amount);
    }

    /**
     * @notice Withdraw governance token.
     * @param amount Withdraw amount.
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "YieldEscrow::withdraw: negative or zero amount");
        address account = _msgSender();
        require(voteDelegatorOf(account) == address(0), "YieldEscrow::withdraw: vote delegator only deposit for this account");

        _burn(account, amount);
        ERC20(governanceToken).safeTransfer(account, amount);
        emit Withdraw(account, amount);
    }

    /**
     * @notice Withdraw governance token from vote delegator only.
     * @param account Target account.
     * @param amount Withdraw amount.
     */
    function withdrawFromDelegator(address account, uint256 amount) external {
        require(amount > 0, "YieldEscrow::withdrawFromDelegator: negative or zero amount");
        address voteDelegator = voteDelegatorOf(account);
        require(_msgSender() == voteDelegator, "YieldEscrow::withdrawFromDelegator: caller is not a vote delegator");

        _burn(account, amount);
        emit Withdraw(account, amount);
    }
}
