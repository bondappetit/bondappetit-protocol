// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/GSN/Context.sol";
import "../Market.sol";

contract EastGateway is Context {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;

    /// @notice Address of market contract.
    Market public market;

    /// @notice Address of recipient all buy tokens.
    address public recipient;

    /// @notice An event thats emitted when an account buyed token.
    event Buy(address indexed customer, address currency, uint256 sell, uint256 buy, uint256 reward);

    constructor(address _market, address _recipient) public {
        market = Market(_market);
        recipient = _recipient;
    }

    function buy(ERC20 currency, uint256 amount, uint256 productMin) external returns (bool) {
        currency.safeTransferFrom(_msgSender(), address(this), amount);

        uint256 currencyBalance = currency.balanceOf(address(this));
        if (currency.allowance(address(this), address(market)) != 0) {
            currency.safeApprove(address(market), 0);
        }
        currency.safeApprove(address(market), currencyBalance);
        market.buy(address(currency), currencyBalance, productMin);

        ERC20 product = ERC20(market.productToken());
        uint256 productBalance = product.balanceOf(address(this));
        product.safeTransfer(recipient, productBalance);

        ERC20 reward = ERC20(market.rewardToken());
        uint256 rewardBalance = reward.balanceOf(address(this));
        if (rewardBalance > 0) {
            reward.safeTransfer(_msgSender(), rewardBalance);
        }

        emit Buy(_msgSender(), address(currency), currencyBalance, productBalance, rewardBalance);

        return true;
    }
}
