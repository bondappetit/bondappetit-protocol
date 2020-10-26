pragma solidity 0.5.17;

import "./token/IERC20.sol";
import "./access/Ownable.sol";
import "./SafeMath.sol";
import "./token/SafeERC20.sol";
import "./uniswap/IUniswapV2Router02.sol";
import "./Bond.sol";

contract Investment is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    ///@notice Address of cumulative token
    address public cumulative;

    ///@notice Address of Bond token
    Bond public bond;

    uint8 internal constant BOND_PRICE_DECIMALS = 6;

    ///@notice Price Bond token
    uint256 public bondPrice = 1000000;

    ///@notice Address of UniswapV2Router
    IUniswapV2Router02 internal uniswapRouter;

    ///@notice Investment tokens list
    mapping(address => bool) public investmentTokens;

    event Allowed(address token);

    event Denied(address token);

    event BondPriceChanged(uint256 newPrice);

    event Invested(address investor, address token, uint256 amount, uint256 reward);

    event Withdrawal(address recipient, address token, uint256 amount);

    /**
     * @param _cumulative Address of cumulative token
     * @param _bond Address of Bond token
     * @param _uniswapRouter Address of UniswapV2Router
     */
    constructor(
        address _cumulative,
        address _bond,
        address _uniswapRouter
    ) public {
        cumulative = _cumulative;
        bond = Bond(_bond);
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    /**
     * @notice Add token to investable tokens white list
     * @param token Allowable token
     */
    function allowToken(address token) external onlyOwner {
        investmentTokens[token] = true;
        emit Allowed(token);
    }

    /**
     * @notice Remove token from investable tokens white list
     * @param token Denied token
     */
    function denyToken(address token) external onlyOwner {
        investmentTokens[token] = false;
        emit Denied(token);
    }

    /**
     * @notice Update Bond token price
     * @param newPrice New price of Bond token of USD (6 decimal)
     */
    function changeBondPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Investment::changeBondPrice: invalid new bond price");

        bondPrice = newPrice;
        emit BondPriceChanged(newPrice);
    }

    /**
     * @param token Invested token
     * @return Pools for each consecutive pair of addresses must exist and have liquidity
     */
    function _path(address token) internal view returns (address[] memory) {
        address[] memory path = new address[](3);
        path[0] = token;
        path[1] = uniswapRouter.WETH();
        path[2] = cumulative;
        return path;
    }

    /**
     * @param token Invested token
     * @param amount Invested amount
     * @return Amount cumulative token after swap
     */
    function _amountOut(address token, uint256 amount) internal view returns (uint256) {
        uint256[] memory amountsOut = uniswapRouter.getAmountsOut(amount, _path(token));
        require(amountsOut.length == 3, "Investment::_amountOut: invalid amounts out length");

        return amountsOut[2];
    }

    /**
     * @param token Invested token
     * @param amount Invested amount
     * @return Amount bond token after swap
     */
    function price(address token, uint256 amount) external view returns (uint256) {
        require(investmentTokens[token], "Investment::price: invalid investable token");

        uint256 amountOut = _amountOut(token, amount);
        uint256 decimals = IERC20(cumulative).decimals();

        return amountOut.mul(10**(18 - decimals + BOND_PRICE_DECIMALS)).div(bondPrice);
    }

    /**
     * @notice Invest tokens to protocol
     * @param token Invested token
     * @param amount Invested amount
     */
    function invest(address token, uint256 amount) external returns (bool) {
        uint256 reward = this.price(token, amount);
        require(reward != 0, "Investment::invest: liquidity pool is empty");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        IERC20(token).safeApprove(address(uniswapRouter), amount);
        uniswapRouter.swapExactTokensForTokens(amount, _amountOut(token, amount), _path(token), address(this), block.timestamp);

        bond.transferLock(msg.sender, reward);

        emit Invested(msg.sender, token, amount, reward);
        return true;
    }

    /**
     * @notice Withdraw invested token to address
     * @param recipient Recipient of tokens
     */
    function withdraw(address recipient) external onlyOwner {
        require(recipient != address(0), "Investment::withdraw: cannot transfer to the zero address");

        uint256 balance = IERC20(cumulative).balanceOf(address(this));
        IERC20(cumulative).safeTransfer(recipient, balance);

        emit Withdrawal(recipient, address(cumulative), balance);
    }
}
