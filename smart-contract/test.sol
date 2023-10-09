// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleTestContract {
    address public owner;

    // Constructor to set the owner of the contract to the address that deploys it
    constructor() {
        owner = msg.sender;
    }

    // Event to emit when funds are received
    event Received(address sender, uint256 amount);

    // Payable function to receive ether
    function subscribe() external payable {
        require(msg.value > 0, "Must send some ether");
        emit Received(msg.sender, msg.value);
    }

    // Function to withdraw funds from the contract
    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
}
