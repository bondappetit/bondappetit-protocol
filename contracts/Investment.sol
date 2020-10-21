pragma solidity 0.5.17;

import "./token/IERC20.sol";
import "./access/Ownable.sol";
import "./SafeMath.sol";
import "./compound/UniswapAnchoredView.sol";
import "./uniswap/IUniswapV2Router02.sol";
import "./Bond.sol";

contract Investment is Ownable {
    using SafeMath for uint256;

    ///@notice Address of Bond token
    Bond public bond;

    ///@notice Price Bond token in USD (6 decimal)
    uint256 public bondPrice = 10**6; // 1 USD to 1 Bond by default

    ///@notice Address of storage token
    address public targetToken;

    ///@notice Address of Price oracle
    UniswapAnchoredView internal priceOracle;

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
     * @param _targetToken Address of storage token
     * @param _bond Address of Bond token
     * @param _priceOracle Address of Price oracle
     * @param _uniswapRouter Address of UniswapV2Router
     */
    constructor(
        address _targetToken,
        address _bond,
        address _priceOracle,
        address _uniswapRouter
    ) public {
        targetToken = _targetToken;
        bond = Bond(_bond);
        priceOracle = UniswapAnchoredView(_priceOracle);
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
     * @notice Get price invested token by USD
     * @param token Invested token smart contract
     * @return Price invested token in USD
     */
    function priceUSD(address token) external view returns (uint256) {
        require(token != address(0), "Investment::price: cannot use zero address");

        string memory tokenName = IERC20(token).symbol();
        uint256 tokenPriceUSD = priceOracle.price(tokenName);
        require(tokenPriceUSD > 0, "Investment::price: invalid investable token price");

        return tokenPriceUSD.mul(10**12);
    }

    /**
     * @notice Get price invested token by Bond token
     * @param token Invested token smart contract
     * @return Price invested token by Bond token
     */
    function price(address token) external view returns (uint256) {
        return this.priceUSD(token).mul(10**6).div(bondPrice);
    }

    /**
     * @notice Exchanges invested tokens for bond
     * @param token Invested token smart contract
     * @param amount Invested amount
     */
    function invest(address token, uint256 amount) external {
        require(investmentTokens[token], "Investment::price: invalid investable token");

        uint256 reward = this.price(token);
        require(bond.balanceOf(address(this)) >= reward, "Investment::invest: too much investment");

        uint256 tokenPriceUSD = this.priceUSD(token);
        uint256 targetTokenPriceUSD = this.priceUSD(targetToken);

        IERC20 tokenContract = IERC20(token);

        tokenContract.transferFrom(msg.sender, address(this), amount);
        require(tokenContract.approve(address(uniswapRouter), amount), "Investment::invest: swap token to target failed");
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = targetToken;
        uniswapRouter.swapExactTokensForTokens(amount, amount.mul(tokenPriceUSD.div(targetTokenPriceUSD)), path, address(this), block.timestamp);

        bond.transferLock(msg.sender, reward);

        emit Invested(msg.sender, token, amount, reward);
    }

    /**
     * @notice Withdraw invested token to address
     * @param recipient Recipient of tokens
     */
    function withdraw(address recipient) external onlyOwner {
        require(recipient != address(0), "Investment::withdraw: cannot transfer to the zero address");

        IERC20 targetTokenContract = IERC20(targetToken);

        uint256 balance = targetTokenContract.balanceOf(address(this));
        targetTokenContract.transfer(recipient, balance);
        emit Withdrawal(recipient, targetToken, balance);
    }
}
