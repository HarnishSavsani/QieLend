
import React from 'react';

export const COLORS = {
  primary: "#d946ef",
  secondary: "#8b5cf6",
  accent: "#ec4899",
  background: "#0f0518",
  surface: "#1e0b2e",
};

export const SUPPORTED_ASSETS = [
  { symbol: 'USDT', name: 'Tether', icon: 'monetization_on', color: 'text-green-400', coingeckoId: 'tether', defaultPrice: 1.00 },
  { symbol: 'USDC', name: 'USD Coin', icon: 'payments', color: 'text-blue-400', coingeckoId: 'usd-coin', defaultPrice: 1.00 },
  { symbol: 'QIE', name: 'QIE Coin', icon: 'diamond', color: 'text-purple-400', coingeckoId: 'qie-coin', defaultPrice: 0.05 }, // Fallback for QIE
  { symbol: 'BTC', name: 'Bitcoin', icon: 'currency_bitcoin', color: 'text-yellow-500', coingeckoId: 'bitcoin', defaultPrice: 65000.00 },
  { symbol: 'ETH', name: 'Ethereum', icon: 'token', color: 'text-blue-500', coingeckoId: 'ethereum', defaultPrice: 3500.00 },
];

export const MOCK_TRANSACTIONS = [
  { id: '8f2a', type: 'Deposit', asset: 'BTC', amount: 0.05, gasFee: 0.0002, date: '2 mins ago', status: 'Completed', txHash: '0x39...a92' },
  { id: 'b49c', type: 'Interest Paid', asset: 'USDT', amount: 24.50, gasFee: 0.0001, date: '1 day ago', status: 'Completed', txHash: '0x71...9A2' },
  { id: '3e21', type: 'Collateral Top-up', asset: 'ETH', amount: 1.2, gasFee: 0.0004, date: '3 days ago', status: 'Completed', txHash: '0x3B...4C1' },
];

export const MOCK_LOANS = [
  { id: 'L1', borrower: 'CryptoNomad', asset: 'USDT', amount: 5000, collateral: 'BTC', collateralAmount: 0.21, apy: 12.5, duration: 30, ltv: 65, status: 'active', dueIn: 245, date: 'Oct 24, 2025' },
  { id: 'L2', borrower: 'DefiWhale', asset: 'USDC', amount: 3200, collateral: 'ETH', collateralAmount: 2.5, apy: 8.4, duration: 90, ltv: 42, status: 'active', dueIn: 12, date: 'Oct 12, 2025' },
];
