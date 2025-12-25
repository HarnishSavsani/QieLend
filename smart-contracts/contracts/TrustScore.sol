// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TrustScore is Ownable {
    
    mapping(address => uint256) public scores;
    mapping(address => bool) public authorizedCallers;

    event ScoreUpdated(address indexed user, uint256 newScore);
    event CallerAuthorized(address indexed caller, bool status);

    constructor() Ownable(msg.sender) {
        // Initial authorized caller is the deployer
        authorizedCallers[msg.sender] = true;
    }

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender], "Caller is not authorized");
        _;
    }

    function setAuthorizedCaller(address _caller, bool _status) external onlyOwner {
        authorizedCallers[_caller] = _status;
        emit CallerAuthorized(_caller, _status);
    }

    function updateScore(address user, int256 change) external onlyAuthorized {
        uint256 currentScore = scores[user];
        if (currentScore == 0) currentScore = 100; // Default start score

        int256 newScore = int256(currentScore) + change;
        
        if (newScore < 0) newScore = 0;
        if (newScore > 1000) newScore = 1000; // Cap score

        scores[user] = uint256(newScore);
        emit ScoreUpdated(user, uint256(newScore));
    }

    function getScore(address user) external view returns (uint256) {
        if (scores[user] == 0) return 100; // Default
        return scores[user];
    }
}
