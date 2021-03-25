// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./IDepositaryBalanceView.sol";

contract CompoundDepositaryBalanceView is Ownable, IDepositaryBalanceView {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @dev Invested cTokens.
    EnumerableSet.AddressSet private tokens;

    /// @notice Balance decimals.
    uint256 public override decimals = 18;

    /// @dev Invested balances.
    mapping(address => uint256) internal balances;

    /// @notice An event thats emitted when an invested token.
    event Invested(address cToken, uint256 amount);

    /// @notice An event thats emitted when an withdrawal token.
    event Withdrawal(address cToken, uint256 amount, uint256 profit, address investRecipient, address profitRecipient);

    /**
     * @param cToken Invested cToken.
     * @return Balance of invested token.
     */
    function balanceOf(address cToken) external view returns (uint256) {
        return balances[cToken];
    }

    /**
     * @notice Invest token to Compound.
     * @param cToken Invested cToken. Target ERC20 token should be approved to contract before call.
     * @param amount Amount of invested token.
     */
    function invest(address cToken, uint256 amount) external onlyOwner {
        require(amount > 0, "CompoundDepositaryBalanceView::invest: invalid amount");

        ERC20 token = ERC20(CToken(cToken).underlying());
        uint256 tokenDecimals = token.decimals();
        require(tokenDecimals <= decimals, "CompoundDepositaryBalanceView::invest: invalid token decimals");
        token.safeTransferFrom(_msgSender(), address(this), amount);

        token.safeApprove(cToken, 0);
        token.safeApprove(cToken, amount);
        CToken(cToken).mint(amount);
        balances[cToken] = balances[cToken].add(amount);
        tokens.add(cToken);
        emit Invested(cToken, amount);
    }

    /**
     * @notice Withdraw invested token and reward.
     * @param cToken Invested cToken.
     * @param investRecipient Recipient of invested token.
     * @param profitRecipient Recipient of reward token.
     */
    function withdraw(
        address cToken,
        address investRecipient,
        address profitRecipient
    ) external onlyOwner {
        uint256 investAmount = balances[cToken];
        require(investAmount > 0, "CompoundDepositaryBalanceView::withdraw: token not invested");

        balances[cToken] = 0;
        tokens.remove(cToken);

        uint256 cTokenBalance = ERC20(cToken).balanceOf(address(this));
        CToken(cToken).redeem(cTokenBalance);

        ERC20 token = ERC20(CToken(cToken).underlying());
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

        emit Withdrawal(cToken, investAmount, profitAmount, investRecipient, profitRecipient);
    }

    /**
     * @return Invested cTokens.
     */
    function investedTokens() external view returns (address[] memory) {
        address[] memory result = new address[](tokens.length());

        for (uint256 i = 0; i < tokens.length(); i++) {
            result[i] = tokens.at(i);
        }

        return result;
    }

    function balance() external view override returns (uint256) {
        uint256 result;

        for (uint256 i = 0; i < tokens.length(); i++) {
            address cToken = tokens.at(i);
            ERC20 token = ERC20(CToken(cToken).underlying());
            uint256 tokenDecimals = token.decimals();

            result = result.add(balances[cToken].mul(10**(decimals.sub(tokenDecimals))));
        }

        return result;
    }
}

abstract contract CToken {
    address public underlying;

    function exchangeRateCurrent() public virtual returns (uint256);

    function mint(uint256 mintAmount) external virtual returns (uint256);

    function redeem(uint256 redeemTokens) external virtual returns (uint256);

    function redeemUnderlying(uint256 redeemAmount) external virtual returns (uint256);
}
