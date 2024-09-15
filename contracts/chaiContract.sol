//SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

contract chaiContract{
    struct Memo{
        string name;
        string message;
        uint timestamp;
        address from;
                uint value;
                }
    Memo[] memos;
    address payable owner;
    constructor() {
        owner = payable(msg.sender);
    }
    function buyChai(string memory name, string memory message) public payable {
        require(msg.value > 0, "Please pay greater than 0 ether");
        
        // Transfer the Ether to the owner
        owner.transfer(msg.value);
        
        // Push the memo with the value included
        memos.push(Memo(name, message, block.timestamp, msg.sender, msg.value));
    }
    function getMemos() public view returns (Memo[] memory){
        return memos;
    }
}

