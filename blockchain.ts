
/**
 * QieLend Blockchain Configuration
 * Setting the stage for Smart Contract integration.
 */

export const QIE_CHAIN_CONFIG = {
    chainId: import.meta.env.VITE_QIE_CHAIN_ID,
    chainName: 'QIE Mainnet',
    nativeCurrency: {
        name: 'QIE Coin',
        symbol: 'QIE',
        decimals: 18
    },
    rpcUrls: [import.meta.env.VITE_QIE_RPC_URL],
    blockExplorerUrls: [import.meta.env.VITE_QIE_EXPLORER_URL]
};

export const CONTRACT_ADDRESSES = {
    LendingPool: '0x0000000000000000000000000000000000000000', // To be updated post-deployment
    TrustToken: '0x0000000000000000000000000000000000000000'
};

// Simplified ABI for common lending operations
export const LENDING_POOL_ABI = [
    "function depositCollateral(address asset, uint256 amount) external payable",
    "function borrow(address asset, uint256 amount) external",
    "function repay(uint256 loanId) external payable",
    "function getLoanDetails(uint256 loanId) external view returns (tuple(address borrower, uint256 amount, uint256 collateral, uint8 status))",
];
