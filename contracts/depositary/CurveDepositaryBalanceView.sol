// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "../curve/IRegistry.sol";
import "../uniswap/IUniswapV2Router02.sol";
import "./IDepositaryBalanceView.sol";
import "../curve/IPool.sol";
import "../curve/ILiquidityGauge.sol";
import "../curve/IMinter.sol";

contract CurveDepositaryBalanceView is Ownable, IDepositaryBalanceView {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Curve registry contract.
    IRegistry public registry;

    /// @notice Uniswap router contract.
    IUniswapV2Router02 public uniswapRouter;

    /// @dev Invested pools.
    EnumerableSet.AddressSet private pools;

    /// @notice Balance decimals.
    uint256 public override decimals = 18;

    /// @dev Invested balances.
    mapping(address => uint256) internal balances;

    /// @notice An event thats emitted when an curve registry address changed.
    event RegistryChanged(address registry);

    /// @notice An event thats emitted when an uniswap router address changed.
    event UniswapRouterChanged(address uniswapRouter);

    /// @notice An event thats emitted when an invested token.
    event Invested(address pool, address token, uint256 amount);

    /// @notice An event thats emitted when an withdrawal token.
    event Withdrawal(address token, uint256 amount, uint256 profit, address investRecipient, address profitRecipient);

    /**
     * @param _registry Curve registry contract address.
     * @param _uniswapRouter Uniswap router contract address.
     */
    constructor(address _registry, address _uniswapRouter) public {
        registry = IRegistry(_registry);
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    /**
     * @param _registry New Curve registry contract address.
     */
    function changeRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "CurveDepositaryBalanceView::changeRegistry: invalid registry address");

        registry = IRegistry(_registry);
        emit RegistryChanged(_registry);
    }

    /**
     * @param _uniswapRouter New Uniswap router contract address.
     */
    function changeUniswap(address _uniswapRouter) external onlyOwner {
        require(_uniswapRouter != address(0), "CurveDepositaryBalanceView::changeUniswap: invalid uniswap address");

        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        emit UniswapRouterChanged(_uniswapRouter);
    }

    /**
     * @param pool Target liquidity pool address.
     * @return Liquidity pool token.
     */
    function _getPoolLiquidityToken(address pool) internal view returns (ERC20) {
        address tokenAddress = registry.get_lp_token(pool);
        require(tokenAddress != address(0), "CurveDepositaryBalanceView::_getPoolLiquidityToken: liquidity token not found");

        return ERC20(tokenAddress);
    }

    /**
     * @param pool Target liquidity pool address.
     * @return Liquidity gauge.
     */
    function _getPoolLiquidityGauge(address pool) internal view returns (ILiquidityGauge) {
        (address[10] memory gauges, ) = registry.get_gauges(pool);
        require(gauges[0] != address(0), "CurveDepositaryBalanceView::_getPoolLiquidityGauge: liquidity gauge not found");

        return ILiquidityGauge(gauges[0]);
    }

    /**
     * @param pool Invested pool.
     * @return Balance of invested pool.
     */
    function balanceOf(address pool) external view returns (uint256) {
        return balances[pool];
    }

    /**
     * @notice Lock all liquidity pool token in liquidity gauge.
     * @param pool Target liquidity pool address.
     */
    function _lock(address pool) internal {
        ILiquidityGauge gauge = _getPoolLiquidityGauge(pool);
        ERC20 lpToken = _getPoolLiquidityToken(pool);
        uint256 balance = lpToken.balanceOf(address(this));
        if (balance == 0) return;

        lpToken.safeApprove(address(gauge), 0);
        lpToken.safeApprove(address(gauge), balance);
        gauge.deposit(balance);
    }

    /**
     * @notice Unlock all liquidity pool token from liquidity gauge.
     * @param pool Target liquidity pool address.
     */
    function _unlock(address pool) internal {
        ILiquidityGauge gauge = _getPoolLiquidityGauge(pool);
        uint256 balance = ERC20(address(gauge)).balanceOf(address(this));

        gauge.withdraw(balance);
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

        ILiquidityGauge gauge = _getPoolLiquidityGauge(pool);
        IMinter minter = IMinter(gauge.minter());
        minter.mint(address(gauge));

        ERC20 crv = ERC20(minter.token());
        uint256 crvBalance = crv.balanceOf(address(this));
        if (crvBalance == 0) return;

        if (toToken != address(crv)) {
            address[] memory path = new address[](2);
            path[0] = address(address(crv));
            path[1] = address(toToken);

            uint256[] memory amountsOut = uniswapRouter.getAmountsOut(crvBalance, path);
            require(amountsOut.length == 2, "CurveDepositaryBalanceView::mintCrv: invalid amount out");
            uint256 amountOut = amountsOut[amountsOut.length - 1];
            require(amountOut > 0, "CurveDepositaryBalanceView::mintCrv: liquidity pool is empty");

            crv.safeApprove(address(uniswapRouter), 0);
            crv.safeApprove(address(uniswapRouter), crvBalance);
            uniswapRouter.swapExactTokensForTokens(crvBalance, amountOut, path, recipient, block.timestamp);
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
        require(tokenIndex < 3, "CurveDepositaryBalanceView::invest: invalid token index");

        address tokenAddress = IPool(pool).coins(tokenIndex);
        require(tokenAddress != address(0), "CurveDepositaryBalanceView::invest: invalid invest token");

        ERC20 token = ERC20(tokenAddress);
        uint256 tokenDecimals = token.decimals();
        require(tokenDecimals <= decimals, "CurveDepositaryBalanceView::invest: invalid token decimals");
        token.safeTransferFrom(_msgSender(), address(this), amount);

        balances[pool] = balances[pool].add(amount.mul(10**(decimals.sub(tokenDecimals)))); // Only stable token sum
        pools.add(pool);

        token.safeApprove(pool, 0);
        token.safeApprove(pool, amount);
        uint256[3] memory deposit;
        deposit[tokenIndex] = amount;
        IPool(pool).add_liquidity(deposit, 0);
        _lock(pool);

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
        require(tokenIndex < 3, "CurveDepositaryBalanceView::invest: invalid token index");

        address tokenAddress = IPool(pool).coins(tokenIndex);
        require(tokenAddress != address(0), "CurveDepositaryBalanceView::withdraw: invalid withdraw token");
        ERC20 lpToken = _getPoolLiquidityToken(pool);

        uint256 investAmount = balances[pool];
        balances[pool] = 0;
        pools.remove(pool);

        _unlock(pool);
        uint256 lpBalance = lpToken.balanceOf(address(this));
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
