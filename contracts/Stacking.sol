// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Stacking is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;

    /// @notice Address of reward token contract.
    ERC20 public rewardToken;

    /// @notice Reward configuration.
    struct Reward {
        // Current reward per block.
        uint256 delta;

        // Block number of last change reward.
        uint256 blockAt;

        // Price of last change reward.
        uint256 priceAt;
    }

    /// @notice Reward configuration of locked tokens.
    mapping(address => Reward) public rewards;

    /// @notice Current blanace of account.
    struct Balance {
        // Locked token amount.
        uint256 amount;

        // Nominal cost of locked token amount.
        uint256 cost;
    }

    /// @notice Balances of locked tokens for all accounts.
    mapping(address => mapping(address => Balance)) public balances;

    /// @notice An event thats emitted when an token reward changed.
    event RewardChanged(address token, uint256 from, uint256 to);

    /// @notice An event thats emitted when a token is locked by an account.
    event Locked(address account, address token, uint256 amount);

    /// @notice An event thats emitted when a token is unlocked by an account.
    event Unlocked(address account, address token);

    /**
     * @param _rewardToken Address of reward token contract.
     */
    constructor(address _rewardToken) public {
        rewardToken = ERC20(_rewardToken);
    }

    /**
     * @notice Change reward token delta.
     * @param token Changed token address.
     * @param newDelta New reward delta.
     */
    function changeReward(address token, uint256 newDelta) external onlyOwner {
        Reward storage reward = rewards[token];
        rewards[token] = Reward(newDelta, block.number.sub(1), price(token).sub(reward.delta));
        emit RewardChanged(token, reward.delta, newDelta);
    }

    /**
     * @notice Get current price of token.
     * @param token Address of token.
     * @return Price of token.
     */
    function price(address token) public view returns (uint256) {
        Reward storage reward = rewards[token];
        return reward.priceAt.add(reward.delta.mul(block.number.sub(reward.blockAt)));
    }

    /**
     * @notice Get current reward of token for sender.
     * @param token Address of token.
     * @return Reward of token for sender.
     */
    function reward(address token) public view returns (uint256) {
        uint256 decimals = rewardToken.decimals();
        Balance storage balance = balances[msg.sender][token];
        return balance.amount.mul(price(token)).sub(balance.cost).div(10**decimals);
    }

    /**
     * @notice Stacking token.
     * @param token Address of stacking token.
     * @param amount Amount of stacking token.
     */
    function lock(address token, uint256 amount) external {
        require(amount != 0, "Stacking::lock: negative amount");

        ERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        Balance storage balance = balances[msg.sender][token];
        uint256 newAmount = balance.amount.add(amount);
        uint256 newCost = balance.cost.add(amount.mul(price(token)));
        balances[msg.sender][token] = Balance(newAmount, newCost);
        emit Locked(msg.sender, token, amount);
    }

    /**
     * @notice Unstacking token.
     * @param token Address of unstacking token.
     */
    function unlock(address token) external {
        Balance memory balance = balances[msg.sender][token];
        require(balance.amount > 0, "Stacking::unlock: balance is empty");
        uint256 _reward = reward(token);

        balances[msg.sender][token] = Balance(0, 0);
        ERC20(token).safeTransfer(msg.sender, balance.amount);
        if (_reward > 0) {
            rewardToken.safeTransfer(msg.sender, _reward);
        }
        emit Unlocked(msg.sender, token);
    }
}
