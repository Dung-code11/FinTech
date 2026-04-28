export type WalletType = 'CASH' | 'CREDIT' | string;
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | string;

export interface Wallet {
  id: string;
  name: string;
  currency: string;
  type: WalletType;
  balance: number;
  creditLimit: number;
  unpaidBalance: number;
  expiryDate: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  walletId: string | null;
  toWalletId: string | null;
  categoryName: string;
  createdAt: string;
}

export interface Category {
  id: string;
  categoryName: string;
}

export interface Budget {
  id: string;
  budgetName: string;
  type: string;
  amount: number;
  spent: number;
  progress: number;
  startDate: string | null;
  endDate: string | null;
  period: string | null;
  walletId: string | null;
  categories: Category[];
}

export interface Debt {
  id: string;
  name: string;
  currency: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  createdDate: string | null;
  targetDate: string | null;
  note: string;
  walletId: string | null;
}

export interface SavingTransaction {
  id: string;
  note: string;
  amount: number;
  transactionDate: string | null;
  walletId: string | null;
}

export interface Saving {
  id: string;
  title: string;
  currency: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  type: string;
  category: string;
  targetDate: string | null;
  period: string | null;
  walletId: string | null;
  transactions: SavingTransaction[];
}

export interface DashboardSnapshot {
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: Budget[];
  debts: Debt[];
  savings: Saving[];
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  usdRate: number;
  dailyChange: number;
}
