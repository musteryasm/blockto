// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MonthlySubscription {

    // Subscription price in wei
    uint256 public subscriptionPrice;

    // Owner of the contract
    address public owner;

    // Mapping of subscribers to their expiration timestamps
    mapping(address => uint256) public subscribers;

    // Events
    event Subscribed(address indexed user, uint256 expiry);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(uint256 _subscriptionPrice) {
        owner = msg.sender;
        subscriptionPrice = _subscriptionPrice;
    }

    // Subscribe function
    function subscribe() external payable {
        require(msg.value == subscriptionPrice, "Incorrect subscription fee");

        // If the user is already subscribed, extend their subscription
        if (isSubscribed(msg.sender)) {
            subscribers[msg.sender] += 30 days;
        } else {
            subscribers[msg.sender] = block.timestamp + 30 days;
        }

        emit Subscribed(msg.sender, subscribers[msg.sender]);
    }

    // Check if a user is subscribed
    function isSubscribed(address _user) public view returns (bool) {
        return subscribers[_user] > block.timestamp;
    }

    // Update subscription price
    function updateSubscriptionPrice(uint256 _newPrice) external onlyOwner {
        subscriptionPrice = _newPrice;
    }

    // Withdraw funds from the contract
    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
