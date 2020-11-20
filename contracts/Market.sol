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

    uint256 public constant PRICE_DECIMALS = 6;

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

    /// @dev Allowed tokens symbols list.
    mapping(address => string) internal allowedTokens;

    event CumulativeChanged(address newToken);

    event TokenAllowed(address token, string symbol);

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
     * @param newToken Address new cumulative token.
     * @param recipient Address of recipient for withdraw current cumulative balance.
     */
    function changeCumulativeToken(address newToken, address recipient) external onlyOwner {
        withdraw(recipient);
        cumulative = ERC20(newToken);
        emit CumulativeChanged(newToken);
    }

    /**
     * @notice Add token to tokens white list.
     * @param token Allowable token.
     */
    function allowToken(address token, string calldata symbol) external onlyOwner {
        allowedTokens[token] = symbol;
        emit TokenAllowed(token, symbol);
    }

    /**
     * @notice Remove token from tokens white list.
     * @param token Denied token.
     */
    function denyToken(address token) external onlyOwner {
        allowedTokens[token] = "";
        emit TokenDenied(token);
    }

    /**
     * @param token Target token.
     * @return Is target token allowed.
     */
    function isAllowedToken(address token) public view returns (bool) {
        return bytes(allowedTokens[token]).length != 0;
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

    function _bondPrice(uint256 amount) internal view returns (uint256) {
        return amount.mul(10**PRICE_DECIMALS).div(bondPrice);
    }

    function price(
        ERC20 product,
        ERC20 token,
        uint256 amount
    ) internal view returns (uint256) {
        require(isAllowedToken(address(token)), "Market::price: invalid token");

        uint256 tokenDecimals = token.decimals();
        uint256 productDecimals = product.decimals();
        uint256 tokenPrice = priceOracle.price(allowedTokens[address(token)]);
        uint256 cumulativePrice = priceOracle.price(cumulative.symbol());

        uint256 result = amount.mul(10**productDecimals.sub(tokenDecimals));
        if (address(product) != address(token)) {
            result = tokenPrice.mul(10**PRICE_DECIMALS).div(cumulativePrice).mul(amount).div(10**PRICE_DECIMALS).mul(10**productDecimals.sub(tokenDecimals));
        }
        if (address(product) == address(bond)) {
            return _bondPrice(result);
        }

        return result;
    }

    function priceABT(address token, uint256 amount) external view returns (uint256) {
        return price(ERC20(address(abt)), ERC20(token), amount);
    }

    function priceBond(address token, uint256 amount) external view returns (uint256) {
        return price(ERC20(address(bond)), ERC20(token), amount);
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
        ERC20 token,
        uint256 amount
    ) internal returns (bool) {
        require(isAllowedToken(address(token)), "Market::buy: invalid token");

        uint256 reward = price(product, token, amount);
        token.safeTransferFrom(msg.sender, address(this), amount);

        if (address(token) != address(cumulative)) {
            uint256 amountOut = _amountOut(address(token), amount);
            require(amountOut != 0, "Market::buy: liquidity pool is empty");

            token.safeApprove(address(uniswapRouter), amount);
            uniswapRouter.swapExactTokensForTokens(amount, amountOut, _path(address(token)), address(this), block.timestamp);
        }

        product.transfer(msg.sender, reward);
        emit Buy(msg.sender, address(product), address(token), amount, reward);

        return true;
    }

    function buyABT(address token, uint256 amount) external returns (bool) {
        return buy(ERC20(address(abt)), ERC20(token), amount);
    }

    function buyBond(address token, uint256 amount) external returns (bool) {
        return buy(ERC20(address(bond)), ERC20(token), amount);
    }

    function buyFromETH(ERC20 product) internal returns (bool) {
        ERC20 token = ERC20(uniswapRouter.WETH());
        uint256 amount = msg.value;
        require(isAllowedToken(address(token)), "Market::buyFromETH: invalid token");

        uint256 reward = price(product, token, amount);

        if (address(token) != address(cumulative)) {
            uint256 amountOut = _amountOut(address(token), amount);
            require(amountOut != 0, "Market::buyFromETH: liquidity pool is empty");

            uniswapRouter.swapExactETHForTokens{value: amount}(amountOut, _path(address(token)), address(this), block.timestamp);
        }

        product.transfer(msg.sender, reward);
        emit Buy(msg.sender, address(product), address(token), amount, reward);

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
    function withdraw(address recipient) public onlyOwner {
        require(recipient != address(0), "Market::withdraw: cannot transfer to the zero address");

        uint256 balance = cumulative.balanceOf(address(this));
        cumulative.safeTransfer(recipient, balance);

        emit Withdrawal(recipient, address(cumulative), balance);
    }
}
