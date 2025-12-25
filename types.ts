
export interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  valueUsd: number;
  network: string;
  icon: string;
}

export interface LoanRequest {
  id: string;
  borrower: string;
  asset: string;
  amount: number;
  collateral: string;
  collateralAmount: number;
  apy: number;
  duration: number; // days
  ltv: number;
  risk: string;
  status: 'active' | 'pending' | 'completed' | 'failed';
  date: string;
  dueIn?: number;
}

export interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdraw' | 'Borrow' | 'Lend' | 'Repayment' | 'Bridge' | 'Interest Paid' | 'Collateral Top-up';
  asset: string;
  amount: number;
  gasFee: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Active';
  txHash: string;
  counterparty?: string;
}

export interface NetworkInsights {
  speed: string;
  gasSaved: number;
  securityScore: number;
}
