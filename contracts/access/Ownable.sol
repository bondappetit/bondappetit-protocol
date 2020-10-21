pragma solidity 0.5.17;

contract Ownable {
    ///@notice Current contract owner
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() internal {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    ///@notice Throws if called by any account other than the owner
    modifier onlyOwner() {
        require(_owner == msg.sender, "Investment: caller is not the owner");
        _;
    }

    /**
     * @notice Returns the address of the current owner
     * @return Current contract owner address
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @notice Transfers ownership of the contract to a new account. Can only be called by the current owner
     * @param newOwner New owner contract
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Investment::tranferOwnership: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}
