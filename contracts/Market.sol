// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./Bond.sol";
import "./ABT.sol";
import "./uniswap/IUniswapV2Router02.sol";
import "./uniswap/IUniswapAnchoredView.sol";

contract Market is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;

    uint256 public constant PRICE_ACCURACY = 18;

    /// @notice Address of cumulative token.
    ERC20 public cumulative;

    /// @notice Address of ABT token contract.
    ABT public abt;

    /// @notice Address of Bond token contract.
    Bond public bond;

    /// @notice Price Bond token
    uint256 public bondPrice = 1000000;

    /// @dev Address of UniswapV2Router.
    IUniswapV2Router02 public uniswapRouter;

    /// @dev Address of IUniswapAnchoredView.
    IUniswapAnchoredView public priceOracle;

    /// @notice Allowed tokens list.
    mapping(address => bool) public allowedTokens;

    event TokenAllowed(address token);

    event TokenDenied(address token);

    event BondPriceChanged(uint256 newPrice);

    event Buy(address customer, address product, address token, uint256 amount, uint256 buy);

    event Withdrawal(address recipient, address token, uint256 amount);

    constructor(
        address _cumulative,
        address _abt,
        address _bond,
        address _uniswapRouter,
        address _priceOracle
    ) public {
        cumulative = ERC20(_cumulative);
        abt = ABT(_abt);
        bond = Bond(_bond);
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        priceOracle = IUniswapAnchoredView(_priceOracle);
    }

    /**
     * @notice Add token to tokens white list.
     * @param token Allowable token.
     */
    function allowToken(address token) external onlyOwner {
        allowedTokens[token] = true;
        emit TokenAllowed(token);
    }

    /**
     * @notice Remove token from tokens white list.
     * @param token Denied token.
     */
    function denyToken(address token) external onlyOwner {
        allowedTokens[token] = false;
        emit TokenDenied(token);
    }

    /**
     * @notice Update Bond token price
     * @param newPrice New price of Bond token of USD (6 decimal)
     */
    function changeBondPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Market::changeBondPrice: invalid new bond price");

        bondPrice = newPrice;
        emit BondPriceChanged(newPrice);
    }

    function transfer(
        ERC20 from,
        address recipient,
        uint256 amount
    ) internal {
        require(recipient != address(0), "Market::transfer: cannot transfer to the zero address");

        uint256 currentBalance = from.balanceOf(address(this));
        require(amount <= currentBalance, "Market::transfer: not enough tokens");

        from.transfer(recipient, amount);
    }

    function transferABT(address recipient, uint256 amount) external onlyOwner {
        transfer(ERC20(address(abt)), recipient, amount);
    }

    function transferBond(address recipient, uint256 amount) external onlyOwner {
        transfer(ERC20(address(bond)), recipient, amount);
    }

    function price(address token, uint256 amount) internal view returns (uint256) {
        uint256 cumulativePrice = priceOracle.price(cumulative.symbol());
        cumulativePrice = cumulativePrice.mul(10**PRICE_ACCURACY);
        uint256 tokenPrice = priceOracle.price(ERC20(token).symbol());
        tokenPrice = tokenPrice.mul(10**PRICE_ACCURACY);

        return tokenPrice.div(cumulativePrice).mul(amount);
    }

    function _bondPrice(uint256 amount) internal view returns (uint256) {
        uint256 decimals = cumulative.decimals();
        uint256 bondDecimals = bond.decimals();

        return amount.mul(10**(18 - decimals + bondDecimals)).div(bondPrice);
    }

    function priceABT(address token, uint256 amount) external view returns (uint256) {
        return price(token, amount);
    }

    function priceBond(address token, uint256 amount) external view returns (uint256) {
        return _bondPrice(price(token, amount));
    }

    /**
     * @param token Buy token.
     * @return Pools for each consecutive pair of addresses must exist and have liquidity
     */
    function _path(address token) internal view returns (address[] memory) {
        address weth = uniswapRouter.WETH();
        if (weth == token) {
            address[] memory path = new address[](2);
            path[0] = token;
            path[1] = address(cumulative);
            return path;
        }

        address[] memory path = new address[](3);
        path[0] = token;
        path[1] = weth;
        path[2] = address(cumulative);
        return path;
    }

    /**
     * @param token Buy token.
     * @param amount Buy amount.
     * @return Amount cumulative token after swap.
     */
    function _amountOut(address token, uint256 amount) internal view returns (uint256) {
        uint256[] memory amountsOut = uniswapRouter.getAmountsOut(amount, _path(token));
        require(amountsOut.length != 0, "Market::_amountOut: invalid amounts out length");

        return amountsOut[amountsOut.length - 1];
    }

    function buy(
        ERC20 product,
        address token,
        uint256 amount
    ) internal returns (bool) {
        require(allowedTokens[token], "Market::buy: invalid token");
        uint256 reward = amount;
        if (address(product) == address(bond)) {
            reward = _bondPrice(reward);
        }

        ERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        if (token != address(cumulative)) {
            uint256 amountOut = _amountOut(token, amount);
            require(amountOut != 0, "Market::buy: liquidity pool is empty");
            reward = price(token, amount);
            if (address(product) == address(bond)) {
                reward = _bondPrice(reward);
            }

            ERC20(token).safeApprove(address(uniswapRouter), amount);
            uniswapRouter.swapExactTokensForTokens(amount, amountOut, _path(token), address(this), block.timestamp);
        }

        product.transfer(msg.sender, reward);
        emit Buy(msg.sender, address(product), token, amount, reward);

        return true;
    }

    function buyABT(address token, uint256 amount) external returns (bool) {
        return buy(ERC20(address(abt)), token, amount);
    }

    function buyBond(address token, uint256 amount) external returns (bool) {
        return buy(ERC20(address(bond)), token, amount);
    }

    function buyFromETH(ERC20 product) internal returns (bool) {
        address token = uniswapRouter.WETH();
        require(allowedTokens[token], "Market::buyFromETH: invalid investable token");
        uint256 reward = msg.value;
        if (address(product) == address(bond)) {
            reward = _bondPrice(reward);
        }

        if (token != address(cumulative)) {
            uint256 amountOut = _amountOut(token, msg.value);
            require(amountOut != 0, "Market::buyFromETH: liquidity pool is empty");
            reward = price(token, amountOut);
            if (address(product) == address(bond)) {
                reward = _bondPrice(reward);
            }

            uniswapRouter.swapExactETHForTokens{value: msg.value}(amountOut, _path(token), address(this), block.timestamp);
        }

        product.transfer(msg.sender, reward);
        emit Buy(msg.sender, address(product), token, msg.value, reward);

        return true;
    }

    function buyABTFromETH() external payable returns (bool) {
        return buyFromETH(ERC20(address(abt)));
    }

    function buyBondFromETH() external payable returns (bool) {
        return buyFromETH(ERC20(address(bond)));
    }

    /**
     * @notice Withdraw cumulative token to address.
     * @param recipient Recipient of token.
     */
    function withdraw(address recipient) external onlyOwner {
        require(recipient != address(0), "Market::withdraw: cannot transfer to the zero address");

        uint256 balance = cumulative.balanceOf(address(this));
        cumulative.safeTransfer(recipient, balance);

        emit Withdrawal(recipient, address(cumulative), balance);
    }
}
