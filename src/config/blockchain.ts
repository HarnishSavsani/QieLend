
/**
 * QieLend Blockchain Configuration
 * Setting the stage for Smart Contract integration.
 */

// For local development, we enforce these values to avoid .env conflicts
const CHAIN_ID = '31337';
const RPC_URL = 'http://127.0.0.1:8545';

/* 
// Previous dynamic logic (kept for reference when moving to prod)
const CHAIN_ID = import.meta.env.VITE_QIE_CHAIN_ID || '31337';
const RPC_URL = CHAIN_ID === '31337' 
    ? 'http://127.0.0.1:8545' 
    : (import.meta.env.VITE_QIE_RPC_URL || 'https://rpc-main1.qie.org');
*/

export const QIE_CHAIN_CONFIG = {
    chainId: CHAIN_ID,
    chainName: 'QIE Localhost',
    nativeCurrency: {
        name: 'QIE Coin',
        symbol: 'QIE',
        decimals: 18
    },
    rpcUrls: [RPC_URL],
    blockExplorerUrls: []
};

export const CONTRACT_ADDRESSES = {
    LendingPool: import.meta.env.VITE_CONTRACT_LENDING_POOL || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    TrustToken: import.meta.env.VITE_CONTRACT_TRUST_SCORE || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
};

// Simplified ABI for common lending operations
// ABI for LendingPool.sol
export const LENDING_POOL_ABI = [
    "function createLoanRequest(uint256 _amount, uint256 _duration, uint256 _interest) external",
    "function fundLoan(uint256 _loanId) external payable",
    "function repayLoan(uint256 _loanId) external payable",
    "function getLoan(uint256 _loanId) external view returns (tuple(uint256 id, address borrower, address lender, uint256 amount, uint256 interest, uint256 duration, uint256 startTime, bool funded, bool repaid, bool defaulted))",
    "event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount)",
    "event LoanFunded(uint256 indexed loanId, address indexed lender)",
    "event LoanRepaid(uint256 indexed loanId, address indexed borrower)"
];

// ABI for TrustScore.sol
export const TRUST_SCORE_ABI = [
    "function getScore(address user) external view returns (uint256)",
    "function updateScore(address user, int256 change) external"
];
