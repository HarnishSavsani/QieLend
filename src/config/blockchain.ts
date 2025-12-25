
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
    // Localhost Deployments (forcing new addresses to bypass stale .env)
    LendingPool: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788', // import.meta.env.VITE_CONTRACT_LENDING_POOL
    TrustToken: '0x0165878A594ca255338adfa4d48449f69242Eb8F', // import.meta.env.VITE_CONTRACT_TRUST_SCORE
    USDT: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',        // import.meta.env.VITE_CONTRACT_USDT
    WBTC: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',        // import.meta.env.VITE_CONTRACT_WBTC
    QIE: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'          // import.meta.env.VITE_CONTRACT_QIE
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
    "function getLoan(uint256 _loanId) external view returns (tuple(uint256 id, address borrower, address lender, uint256 amount, uint256 interest, uint256 duration, address collateralToken, uint256 collateralAmount, uint256 startTime, bool funded, bool repaid, bool defaulted))",
    "event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, address collateralToken, uint256 collateralAmount)",
    "event LoanFunded(uint256 indexed loanId, address indexed lender)",
    "event LoanRepaid(uint256 indexed loanId, address indexed borrower)"
];

// ABI for TrustScore.sol
export const TRUST_SCORE_ABI = [
    "function getScore(address user) external view returns (uint256)",
    "function updateScore(address user, int256 change) external"
];
