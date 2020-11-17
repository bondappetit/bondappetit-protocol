// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Treasury is Ownable {
    using SafeMath for uint256;

    /**
     * @notice Transfer target token to recipient.
     * @param token Target token.
     * @param recipient Recipient.
     * @param amount Transfer amount.
     */
    function transfer(
        address token,
        address recipient,
        uint256 amount
    ) external onlyOwner returns (bool) {
        return IERC20(token).transfer(recipient, amount);
    }

    /**
     * @notice Approve target token to recipient.
     * @param token Target token.
     * @param recipient Recipient.
     * @param amount Approve amount.
     */
    function approve(
        address token,
        address recipient,
        uint256 amount
    ) external onlyOwner returns (bool) {
        return IERC20(token).approve(recipient, amount);
    }
}
