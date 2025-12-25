// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITrustScore {
    function getScore(address user) external view returns (uint256);
    function updateScore(address user, int256 change) external;
}

contract LendingPool is ReentrancyGuard, Ownable {
    
    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 amount;
        uint256 interest; // Total interest amount
        uint256 duration; // In seconds
        uint256 startTime;
        bool funded;
        bool repaid;
        bool defaulted;
    }

    uint256 public nextLoanId;
    mapping(uint256 => Loan) public loans;
    
    // Address of the TrustScore contract
    ITrustScore public trustScoreContract;

    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed lender);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower);
    event LoanDefaulted(uint256 indexed loanId);

    constructor(address _trustScoreAddress) Ownable(msg.sender) {
        trustScoreContract = ITrustScore(_trustScoreAddress);
    }

    // 1. Borrower creates a loan request
    function createLoanRequest(uint256 _amount, uint256 _duration, uint256 _interest) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        require(_duration > 0, "Duration must be > 0");
        
        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            lender: address(0),
            amount: _amount,
            interest: _interest,
            duration: _duration,
            startTime: 0,
            funded: false,
            repaid: false,
            defaulted: false
        });

        emit LoanCreated(loanId, msg.sender, _amount);
    }

    // 2. Lender funds the loan
    function fundLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];
        require(!loan.funded, "Loan already funded");
        require(msg.sender != loan.borrower, "Cannot fund own loan");
        require(msg.value == loan.amount, "Incorrect ETH amount sent");

        loan.lender = msg.sender;
        loan.funded = true;
        loan.startTime = block.timestamp;

        // Transfer funds to borrower
        (bool sent, ) = loan.borrower.call{value: msg.value}("");
        require(sent, "Failed to send funds to borrower");

        emit LoanFunded(_loanId, msg.sender);
    }

    // 3. Borrower repays the loan
    function repayLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.funded, "Loan not active");
        require(!loan.repaid, "Loan already repaid");
        require(msg.value == loan.amount + loan.interest, "Incorrect repayment amount");

        loan.repaid = true;

        // Transfer funds (principal + interest) to lender
        (bool sent, ) = loan.lender.call{value: msg.value}("");
        require(sent, "Failed to send repayment to lender");

        // Increase Trust Score
        try trustScoreContract.updateScore(loan.borrower, 10) {} catch {}

        emit LoanRepaid(_loanId, msg.sender);
    }

    // 4. Default Check (Callable by anyone, usually a bot)
    function checkDefault(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.funded && !loan.repaid && !loan.defaulted, "Loan not active or already closed");
        
        if (block.timestamp > loan.startTime + loan.duration) {
            loan.defaulted = true;
            
            // Decrease Trust Score
            try trustScoreContract.updateScore(loan.borrower, -20) {} catch {}
            
            emit LoanDefaulted(_loanId);
        }
    }

    // View function for UI
    function getLoan(uint256 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }
}
