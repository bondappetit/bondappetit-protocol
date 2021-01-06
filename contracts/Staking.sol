// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./utils/OwnablePausable.sol";

contract Staking is OwnablePausable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /// @notice Address of rewards distributor.
    address public rewardsDistribution;

    /// @notice Rewards token address.
    IERC20 public rewardsToken;

    /// @notice Staking token address.
    IERC20 public stakingToken;

    /// @notice Block number of rewards distibution period finish.
    uint256 public periodFinish;

    /// @notice Reward distribution amount per block.
    uint256 public rewardRate;

    /// @notice Blocks count in current distribution period.
    uint256 public rewardsDuration;

    /// @notice Block number of last update.
    uint256 public lastUpdateBlock;

    /// @notice Static reward distribution amount per block.
    uint256 public rewardPerTokenStored;

    /// @notice Rewards paid.
    mapping(address => uint256) public userRewardPerTokenPaid;

    /// @notice Earned rewards.
    mapping(address => uint256) public rewards;

    /// @dev Total staking token amount.
    uint256 internal _totalSupply;

    /// @dev Staking balances.
    mapping(address => uint256) internal _balances;

    /// @notice An event thats emitted when an reward token addet to contract.
    event RewardAdded(uint256 reward);

    /// @notice An event thats emitted when an staking token added to contract.
    event Staked(address indexed user, uint256 amount);

    /// @notice An event thats emitted when an staking token withdrawal from contract.
    event Withdrawn(address indexed user, uint256 amount);

    /// @notice An event thats emitted when an reward token withdrawal from contract.
    event RewardPaid(address indexed user, uint256 reward);

    /// @notice An event thats emitted when an rewards distribution address changed.
    event RewardsDistributionChanged(address newRewardsDistribution);

    /**
     * @param _rewardsDistribution Rewards distribution address.
     * @param _rewardsDuration Duration of distribution.
     * @param _rewardsToken Address of reward token.
     * @param _stakingToken Address of staking token.
     */
    constructor(
        address _rewardsDistribution,
        uint256 _rewardsDuration,
        address _rewardsToken,
        address _stakingToken
    ) public {
        rewardsDistribution = _rewardsDistribution;
        rewardsDuration = _rewardsDuration;
        rewardsToken = IERC20(_rewardsToken);
        stakingToken = IERC20(_stakingToken);
    }

    /**
     * @notice Update target account rewards state.
     * @param account Target account.
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateBlock = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /**
     * @return Total staking token amount.
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @param account Target account.
     * @return Staking token amount.
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @return Block number of last reward.
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.number, periodFinish);
    }

    /**
     * @return Reward per token.
     */
    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored.add(lastTimeRewardApplicable().sub(lastUpdateBlock).mul(rewardRate).mul(1e18).div(_totalSupply));
    }

    /**
     * @param account Target account.
     * @return Earned rewards.
     */
    function earned(address account) public view returns (uint256) {
        return _balances[account].mul(rewardPerToken().sub(userRewardPerTokenPaid[account])).div(1e18).add(rewards[account]);
    }

    /**
     * @return Rewards amount for duration.
     */
    function getRewardForDuration() external view returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    /**
     * @notice Stake token.
     * @param amount Amount staking token.
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Staking::stake: cannot stake 0");
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Withdraw staking token.
     * @param amount Amount withdraw token.
     */
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Staking::withdraw: Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Withdraw reward token.
     */
    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /**
     * @notice Withdraw reward and staking token.
     */
    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }

    /**
     * @notice Change rewards distribution address.
     * @param _rewardDistribution New rewards distribution address.
     */
    function changeRewardsDistribution(address _rewardDistribution) external onlyOwner {
        rewardsDistribution = _rewardDistribution;
        emit RewardsDistributionChanged(rewardsDistribution);
    }

    /**
     * @notice Start distribution.
     * @param reward Distributed rewards amount.
     */
    function notifyRewardAmount(uint256 reward) external updateReward(address(0)) {
        require(msg.sender == rewardsDistribution || msg.sender == owner(), "Staking::notifyRewardAmount: caller is not RewardsDistribution or Owner address");

        if (block.number >= periodFinish) {
            rewardRate = reward.div(rewardsDuration);
        } else {
            uint256 remaining = periodFinish.sub(block.number);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(rewardsDuration);
        }

        uint256 balance = rewardsToken.balanceOf(address(this));
        require(rewardRate <= balance.div(rewardsDuration), "Staking::notifyRewardAmount: provided reward too high");

        lastUpdateBlock = block.number;
        periodFinish = block.number.add(rewardsDuration);
        emit RewardAdded(reward);
    }
}
