// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./utils/OwnablePausable.sol";

contract ProfitDistributor is OwnablePausable, ReentrancyGuard {
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

    /// @notice Stake lock period.
    uint256 public lockPeriod;

    /// @notice Stake unlock period.
    uint256 public unlockPeriod;

    /// @notice Rewards paid.
    mapping(address => uint256) public userRewardPerTokenPaid;

    /// @notice Earned rewards.
    mapping(address => uint256) public rewards;

    /// @dev Total staking token amount.
    uint256 internal _totalSupply;

    /// @dev Staking balances.
    mapping(address => uint256) internal _balances;

    /// @dev Block number of stake lock.
    mapping(address => uint256) internal _stakeAt;

    /// @dev Amount of penalty reward.
    mapping(address => uint256) internal _penaltyAmount;

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

    /// @notice An event thats emitted when an rewards tokens transfered to recipient.
    event RewardsTransfered(address recipient, uint256 amount);

    /**
     * @param _rewardsDistribution Rewards distribution address.
     * @param _rewardsDuration Duration of distribution.
     * @param _rewardsToken Address of reward token.
     * @param _stakingToken Address of staking token.
     * @param _lockPeriod Stake lock period.
     * @param _unlockPeriod Stake unlock period.
     */
    constructor(
        address _rewardsDistribution,
        uint256 _rewardsDuration,
        address _rewardsToken,
        address _stakingToken,
        uint256 _lockPeriod,
        uint256 _unlockPeriod
    ) public {
        rewardsDistribution = _rewardsDistribution;
        rewardsDuration = _rewardsDuration;
        rewardsToken = IERC20(_rewardsToken);
        stakingToken = IERC20(_stakingToken);
        lockPeriod = _lockPeriod;
        unlockPeriod = _unlockPeriod;
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

    function lockInfo(address account)
        public
        view
        returns (
            bool locked,
            uint256 mod,
            uint256 nextUnlock,
            uint256 nextLock,
            uint256 stakeAt
        )
    {
        if (lockPeriod > 0) {
            mod = block.number.sub(_stakeAt[account]) % lockPeriod.add(unlockPeriod);
            nextUnlock = block.number.sub(mod).add(lockPeriod);
            nextLock = nextUnlock.add(unlockPeriod);
            locked = mod < lockPeriod;
        }
        stakeAt = _stakeAt[account];
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
     * @param account Target account.
     * @return Penalty rewards.
     */
    function penalty(address account) public view returns (uint256) {
        return _penaltyAmount[account];
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
    function stake(uint256 amount) external nonReentrant updateReward(_msgSender()) {
        require(amount > 0, "ProfitDistributor::stake: cannot stake 0");
        _totalSupply = _totalSupply.add(amount);
        _balances[_msgSender()] = _balances[_msgSender()].add(amount);
        _stakeAt[_msgSender()] = block.number;
        stakingToken.safeTransferFrom(_msgSender(), address(this), amount);
        emit Staked(_msgSender(), amount);
    }

    /**
     * @dev Withdraw staking token.
     * @param amount Amount withdraw token.
     */
    function withdraw(uint256 amount) internal nonReentrant updateReward(_msgSender()) {
        require(amount > 0, "ProfitDistributor::withdraw: Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[_msgSender()] = _balances[_msgSender()].sub(amount);
        stakingToken.safeTransfer(_msgSender(), amount);
        emit Withdrawn(_msgSender(), amount);
    }

    /**
     * @notice Withdraw reward token.
     */
    function getReward() public nonReentrant updateReward(_msgSender()) {
        address account = _msgSender();
        uint256 reward = rewards[account];
        (bool locked, , , , ) = lockInfo(account);
        if (locked) {
            _penaltyAmount[account] = _penaltyAmount[account].add(reward.div(2));
            reward = reward.div(2);
        } else {
            reward = reward.add(_penaltyAmount[account]);
            _penaltyAmount[account] = 0;
        }

        if (reward > 0) {
            rewards[account] = 0;
            rewardsToken.safeTransfer(account, reward);
            emit RewardPaid(account, reward);
        }
    }

    /**
     * @notice Withdraw reward and staking token.
     */
    function exit() external {
        address account = _msgSender();
        withdraw(_balances[account]);
        getReward();

        uint256 penaltyAmount = _penaltyAmount[account];
        if (penaltyAmount > 0) {
            _penaltyAmount[account] = 0;
            this.notifyRewardAmount(penaltyAmount);
        }
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
     * @notice Transfer rewards token to recipient if distribution not start.
     * @param recipient Recipient.
     * @param amount Amount transfered rewards token.
     */
    function transfer(address recipient, uint256 amount) external onlyOwner {
        require(block.number >= periodFinish, "ProfitDistributor::transfer: distribution not ended");

        rewardsToken.safeTransfer(recipient, amount);
        emit RewardsTransfered(recipient, amount);
    }

    /**
     * @notice Start distribution.
     * @param reward Distributed rewards amount.
     */
    function notifyRewardAmount(uint256 reward) external updateReward(address(0)) {
        address sender = _msgSender();
        require(sender == rewardsDistribution || sender == owner() || sender == address(this), "ProfitDistributor::notifyRewardAmount: caller is not RewardsDistribution or Owner address");

        if (block.number >= periodFinish) {
            rewardRate = reward.div(rewardsDuration);
        } else {
            uint256 remaining = periodFinish.sub(block.number);
            if (sender == address(this)) {
                rewardsDuration = remaining;
            }
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(rewardsDuration);
        }

        uint256 balance = rewardsToken.balanceOf(address(this));
        require(rewardRate <= balance.div(rewardsDuration), "ProfitDistributor::notifyRewardAmount: provided reward too high");

        lastUpdateBlock = block.number;
        periodFinish = block.number.add(rewardsDuration);
        emit RewardAdded(reward);
    }
}
