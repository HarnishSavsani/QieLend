
/**
 * QieLend Blockchain Configuration
 * Setting the stage for Smart Contract integration.
 */

// QIE Blockchain Configuration
// Loaded from .env

const CHAIN_ID = import.meta.env.VITE_QIE_CHAIN_ID || '1983';
const RPC_URL = import.meta.env.VITE_QIE_RPC_URL || 'https://rpc1testnet.qie.digital';

export const QIE_CHAIN_CONFIG = {
    chainId: CHAIN_ID,
    chainName: 'QIE Network',
    nativeCurrency: {
        name: 'QIE Coin',
        symbol: 'QIE',
        decimals: 18
    },
    rpcUrls: [RPC_URL],
    blockExplorerUrls: [import.meta.env.VITE_QIE_EXPLORER_URL || 'https://testnet.qiescan.com']
};

export const CONTRACT_ADDRESSES = {
    LendingPool: import.meta.env.VITE_CONTRACT_LENDING_POOL || '', 
    TrustToken: import.meta.env.VITE_CONTRACT_TRUST_SCORE || '', 
    USDT: import.meta.env.VITE_CONTRACT_USDT || '',
    WBTC: import.meta.env.VITE_CONTRACT_WBTC || '',
    QIE: import.meta.env.VITE_CONTRACT_QIE || ''
};

// Generic ERC20 ABI
export const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function transfer(address to, uint amount) returns (bool)",
    "function approve(address spender, uint amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function mint(address to, uint256 amount) external" // Only in MockToken
];

// ABI for LendingPool.sol
export const LENDING_POOL_ABI = [
    "function createLoanRequest(uint256 _amount, uint256 _duration, uint256 _interest, address _collateralToken, uint256 _collateralAmount) external",
    "function fundLoan(uint256 _loanId) external payable",
    "function repayLoan(uint256 _loanId) external payable",
    "function checkDefault(uint256 _loanId) external",
    "function getLoan(uint256 _loanId) external view returns (tuple(uint256 id, address borrower, address lender, uint256 amount, uint256 interest, uint256 duration, address collateralToken, uint256 collateralAmount, uint256 startTime, bool funded, bool repaid, bool defaulted))",
    "event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, address collateralToken, uint256 collateralAmount)",
    "event LoanFunded(uint256 indexed loanId, address indexed lender)",
    "event LoanRepaid(uint256 indexed loanId, address indexed borrower)",
    "event LoanDefaulted(uint256 indexed loanId)"
];

// ABI for TrustScore.sol
export const TRUST_SCORE_ABI = [
    "function getScore(address user) external view returns (uint256)",
    "function updateScore(address user, int256 change) external"
];
