pragma solidity >=0.5.0 <0.6.0;

contract Escrow {
    event Created(uint indexed offerId, address indexed seller, address indexed buyer, uint escrowId);

    function create() public {
        emit Created(block.number, msg.sender, msg.sender, block.number);
    }
}