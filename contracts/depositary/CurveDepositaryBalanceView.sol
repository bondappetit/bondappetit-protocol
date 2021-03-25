// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./IDepositaryBalanceView.sol";
import "../curve/IPool.sol";
import "../curve/IRegistry.sol";
import "../curve/ILiquidityGauge.sol";
import "../curve/IMinter.sol";
import "../uniswap/IUniswapV2Router02.sol";

contract CurveDepositaryBalanceView is Ownable, IDepositaryBalanceView {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Curve registry contract.
    address public registry;

    /// @notice Curve minter contract.
    address public minter;

    /// @notice Uniswap router contract.
    address public uniswapRouter;

    /// @dev Invested pools.
    EnumerableSet.AddressSet private pools;

    /// @notice Balance decimals.
    uint256 public override decimals = 18;

    /// @dev Invested balances.
    mapping(address => uint256) internal balances;

    /// @notice An event thats emitted when an curve registry address changed.
    event RegistryChanged(address registry);

    /// @notice An event thats emitted when an curve minter address changed.
    event MinterChanged(address minter);

    /// @notice An event thats emitted when an uniswap router address changed.
    event UniswapRouterChanged(address uniswapRouter);

    /// @notice An event thats emitted when an invested token.
    event Invested(address pool, address token, uint256 amount);

    /// @notice An event thats emitted when an withdrawal token.
    event Withdrawal(address token, uint256 amount, uint256 profit, address investRecipient, address profitRecipient);

    /**
     * @param _registry Curve registry contract address.
     * @param _minter Curve minter contract address.
     * @param _uniswapRouter Uniswap router contract address.
     */
    constructor(
        address _registry,
        address _minter,
        address _uniswapRouter
    ) public {
        registry = _registry;
        minter = _minter;
        uniswapRouter = _uniswapRouter;
    }

    /**
     * @param _registry New Curve registry contract address.
     */
    function changeRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "CurveDepositaryBalanceView::changeRegistry: invalid registry address");

        registry = _registry;
        emit RegistryChanged(registry);
    }

    /**
     * @param _minter New Curve minter contract address.
     */
    function changeMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "CurveDepositaryBalanceView::changeMinter: invalid minter address");

        minter = _minter;
        emit MinterChanged(minter);
    }

    /**
     * @param _uniswapRouter New Uniswap router contract address.
     */
    function changeUniswap(address _uniswapRouter) external onlyOwner {
        require(_uniswapRouter != address(0), "CurveDepositaryBalanceView::changeUniswap: invalid uniswap address");

        uniswapRouter = _uniswapRouter;
        emit UniswapRouterChanged(uniswapRouter);
    }

    /**
     * @param pool Invested pool.
     * @return Balance of invested pool.
     */
    function balanceOf(address pool) external view returns (uint256) {
        return balances[pool];
    }

    function lock(address pool) internal {
        (address[10] memory gauges, ) = IRegistry(registry).get_gauges(pool);
        address gaugeAddress = gauges[0];
        if (gaugeAddress == address(0)) return;

        address lpTokenAddress = IRegistry(registry).get_lp_token(pool);
        ERC20 lpToken = ERC20(lpTokenAddress);
        uint256 balance = lpToken.balanceOf(address(this));
        if (balance == 0) return;

        lpToken.approve(gaugeAddress, balance);
        ILiquidityGauge(gaugeAddress).deposit(balance);
    }

    function unlock(address pool) internal {
        (address[10] memory gauges, ) = IRegistry(registry).get_gauges(pool);
        address gaugeAddress = gauges[0];
        if (gaugeAddress == address(0)) return;

        uint256 gaugeBalance = ERC20(gaugeAddress).balanceOf(address(this));
        ILiquidityGauge(gaugeAddress).withdraw(gaugeBalance);
    }

    /**
     * @notice Mint CRV tokens and swap to target token.
     * @param pool Target liquidity pool.
     * @param toToken Target token.
     * @param recipient Recipient.
     */
    function mintCrv(
        address pool,
        address toToken,
        address recipient
    ) public onlyOwner {
        require(toToken != address(0), "CurveDepositaryBalanceView::mintCrv: invalid target token address");

        (address[10] memory gauges, ) = IRegistry(registry).get_gauges(pool);
        address gaugeAddress = gauges[0];
        if (gaugeAddress == address(0)) return;

        IMinter(minter).mint(gaugeAddress);

        ERC20 crv = ERC20(IMinter(minter).token());
        uint256 crvBalance = crv.balanceOf(address(this));
        if (crvBalance == 0) return;

        if (toToken != address(crv)) {
            address[] memory path = new address[](2);
            path[0] = address(address(crv));
            path[1] = address(toToken);

            uint256[] memory amountsOut = IUniswapV2Router02(uniswapRouter).getAmountsOut(crvBalance, path);
            if (amountsOut.length == 0) return;
            uint256 amountOut = amountsOut[amountsOut.length - 1];
            if (amountOut == 0) return;

            crv.approve(uniswapRouter, crvBalance);
            IUniswapV2Router02(uniswapRouter).swapExactTokensForTokens(crvBalance, amountOut, path, recipient, block.timestamp);
        } else {
            crv.safeTransfer(recipient, crvBalance);
        }
    }

    /**
     * @notice Invest token to Curve.
     * @param pool Target liquidity pool.
     * @param tokenIndex Invested token index in the pool. Target ERC20 token should be approved to contract before call.
     * @param amount Amount of invested token.
     */
    function invest(
        address pool,
        uint256 tokenIndex,
        uint256 amount
    ) external onlyOwner {
        require(amount > 0, "CurveDepositaryBalanceView::invest: invalid amount");
        require(tokenIndex >= 0 && tokenIndex < 3, "CurveDepositaryBalanceView::invest: invalid token index");

        address tokenAddress = IPool(pool).coins(tokenIndex);
        require(tokenAddress != address(0), "CurveDepositaryBalanceView::invest: invalid invest token");

        ERC20 token = ERC20(tokenAddress);
        uint256 tokenDecimals = token.decimals();
        require(tokenDecimals <= decimals, "CurveDepositaryBalanceView::invest: invalid token decimals");
        token.safeTransferFrom(_msgSender(), address(this), amount);

        token.safeApprove(pool, 0);
        token.safeApprove(pool, amount);
        uint256[3] memory deposit;
        deposit[tokenIndex] = amount;
        IPool(pool).add_liquidity(deposit, 0);
        lock(pool);

        balances[pool] = balances[pool].add(amount.mul(10**(decimals.sub(tokenDecimals))));
        pools.add(pool);
        emit Invested(pool, tokenAddress, amount);
    }

    /**
     * @notice Withdraw invested token and reward.
     * @param pool Target liquidity pool.
     * @param tokenIndex Invested token index in the pool.
     * @param investRecipient Recipient of invested token.
     * @param profitRecipient Recipient of reward token.
     */
    function withdraw(
        address pool,
        uint256 tokenIndex,
        address investRecipient,
        address profitRecipient
    ) external onlyOwner {
        require(tokenIndex >= 0 && tokenIndex < 3, "CurveDepositaryBalanceView::invest: invalid token index");

        address tokenAddress = IPool(pool).coins(tokenIndex);
        require(tokenAddress != address(0), "CurveDepositaryBalanceView::withdraw: invalid withdraw token");

        address lpTokenAddress = IRegistry(registry).get_lp_token(pool);
        require(lpTokenAddress != address(0), "CurveDepositaryBalanceView::withdraw: liquidity pool token address not found");

        uint256 investAmount = balances[pool];
        balances[pool] = 0;
        pools.remove(pool);

        unlock(pool);
        uint256 lpBalance = ERC20(lpTokenAddress).balanceOf(address(this));
        IPool(pool).remove_liquidity_one_coin(lpBalance, int128(tokenIndex), 0);
        mintCrv(pool, tokenAddress, address(this));

        ERC20 token = ERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        uint256 profitAmount;
        if (balance >= investAmount) {
            profitAmount = balance.sub(investAmount);
        } else {
            investAmount = balance;
        }
        token.safeTransfer(investRecipient, investAmount);
        if (profitAmount > 0) {
            token.safeTransfer(profitRecipient, profitAmount);
        }

        emit Withdrawal(tokenAddress, investAmount, profitAmount, investRecipient, profitRecipient);
    }

    /**
     * @return Invested liquidity pools.
     */
    function investedPools() external view returns (address[] memory) {
        address[] memory result = new address[](pools.length());

        for (uint256 i = 0; i < pools.length(); i++) {
            result[i] = pools.at(i);
        }

        return result;
    }

    function balance() external view override returns (uint256) {
        uint256 result;

        for (uint256 i = 0; i < pools.length(); i++) {
            address pool = pools.at(i);
            result = result.add(balances[pool]);
        }

        return result;
    }
}
