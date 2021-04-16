// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";
import "./IPriceFeed.sol";

library CrossPriceFeed {
    using SignedSafeMath for int256;

    /**
     * @param path Price feeds chain.
     * @param amountIn Input amount.
     * @return amounts Output amount of all price feeds.
     */
    function getAmountsOut(address[] memory path, int256 amountIn) internal view returns (int256[] memory amounts) {
        require(path.length > 0, "ChainlinkCrossPriceFeed: invalid path");

        amounts = new int256[](path.length + 1);
        amounts[0] = amountIn;
        for (uint256 i; i < path.length; i++) {
            IPriceFeed priceFeed = IPriceFeed(path[i]);
            uint8 decimals = priceFeed.decimals();
            (, int256 price, , , ) = priceFeed.latestRoundData();

            amounts[i + 1] = amounts[i].mul(price).div(int128(10)**decimals);
        }
    }

    /**
     * @param path Price feeds chain.
     * @param amountIn Input amount.
     * @return Output amount of latest price feed.
     */
    function getAmountOut(address[] memory path, int256 amountIn) internal view returns (int256) {
        return getAmountsOut(path, amountIn)[path.length];
    }
}
