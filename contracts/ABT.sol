// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ABT is ERC20, Ownable {
    /**
     * @param initialSupply Total supply.
     */
    constructor(uint256 initialSupply) public ERC20("Appetit Bond Token", "ABT") {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @param account Recipient of created token.
     * @param amount Amount of token to be created.
     */
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    /**
     * @param account Owner of removed token.
     * @param amount Amount of token to be removed.
     */
    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
}
