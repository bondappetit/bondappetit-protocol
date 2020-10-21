pragma solidity 0.5.17;

interface UniswapAnchoredView {
    function price(string calldata symbol) external view returns (uint);
}