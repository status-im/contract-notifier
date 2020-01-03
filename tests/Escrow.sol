/**
 *Submitted for verification at Etherscan.io on 2019-11-14
*/

pragma solidity >=0.5.0 <0.6.0;

contract Escrow {
    event Created(uint indexed offerId, address indexed seller, address indexed buyer, uint escrowId);
    event Funded(uint indexed escrowId, address indexed buyer, uint expirationTime, uint amount);
    event Paid(uint indexed escrowId, address indexed seller);
    event Released(uint indexed escrowId, address indexed seller, address indexed buyer, bool isDispute);
    event Canceled(uint indexed escrowId, address indexed seller, address indexed buyer);
    

    function create() public {
        emit Created(101, msg.sender, msg.sender, block.number);
    }

    function funded() public {
        emit Funded(block.number, msg.sender, block.number, 20);
    }

    function paid() public {
        emit Paid(block.number, msg.sender);
    }

    function released() public {
        emit Released(block.number, msg.sender, msg.sender);
    }

    function canceled() public {
        emit Canceled(block.number, msg.sender, msg.sender);
    }


}