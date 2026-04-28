import api from './api';

import type {
  Budget,
  DashboardSnapshot,
  Debt,
  Saving,
  SavingTransaction,
  Transaction,
  Wallet,
} from '@/types/finance';
import { sortTransactions } from '@/utils/format';

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeWallet(input: any): Wallet {
  return {
    id: String(input?.id ?? ''),
    name: input?.name ?? 'Ví chưa đặt tên',
    currency: input?.currency ?? 'VND',
    type: input?.type ?? 'CASH',
    balance: toNumber(input?.balance ?? input?.initialBalance),
    creditLimit: toNumber(input?.creditLimit),
    unpaidBalance: toNumber(input?.unpaidBalance),
    expiryDate: input?.expiryDate ?? null,
  };
}

function normalizeTransaction(input: any): Transaction {
  return {
    id: String(input?.id ?? ''),
    type: input?.type ?? 'EXPENSE',
    amount: toNumber(input?.amount),
    description: input?.description ?? '',
    walletId: input?.wallet?.id ?? input?.walletId ?? null,
    toWalletId: input?.toWallet?.id ?? input?.toWalletId ?? null,
    categoryName: input?.category?.categoryName ?? input?.categoryName ?? 'Khác',
    createdAt: input?.createdAt ?? new Date().toISOString(),
  };
}

function normalizeBudget(input: any): Budget {
  return {
    id: String(input?.id ?? ''),
    budgetName: input?.budgetName ?? input?.budget_name ?? 'Ngân sách',
    type: input?.type ?? 'MONTHLY',
    amount: toNumber(input?.amount),
    spent: toNumber(input?.spent),
    progress: toNumber(input?.progress),
    startDate: input?.startDate ?? null,
    endDate: input?.endDate ?? null,
    period: input?.period ?? null,
    walletId: input?.walletId ?? null,
    categories: Array.isArray(input?.categories)
      ? input.categories.map((category: any) => ({
          id: String(category?.id ?? ''),
          categoryName: category?.categoryName ?? 'Khác',
        }))
      : [],
  };
}

function normalizeDebt(input: any): Debt {
  return {
    id: String(input?.id ?? ''),
    name: input?.name ?? 'Khoản nợ',
    currency: input?.currency ?? 'VND',
    totalAmount: toNumber(input?.totalAmount),
    paidAmount: toNumber(input?.paidAmount),
    remainingAmount:
      toNumber(input?.remainingAmount) ||
      Math.max(0, toNumber(input?.totalAmount) - toNumber(input?.paidAmount)),
    createdDate: input?.createdDate ?? null,
    targetDate: input?.targetDate ?? null,
    note: input?.note ?? input?.Note ?? '',
    walletId: input?.walletId ?? null,
  };
}

function normalizeSavingTransaction(input: any): SavingTransaction {
  return {
    id: String(input?.id ?? ''),
    note: input?.note ?? '',
    amount: toNumber(input?.amount),
    transactionDate: input?.transactionDate ?? null,
    walletId: input?.walletId ?? null,
  };
}

function normalizeSaving(input: any): Saving {
  return {
    id: String(input?.id ?? ''),
    title: input?.title ?? 'Mục tiêu tiết kiệm',
    currency: input?.currency ?? 'VND',
    targetAmount: toNumber(input?.targetAmount),
    currentAmount: toNumber(input?.currentAmount),
    progress: toNumber(input?.progress),
    type: input?.type ?? 'GOAL',
    category: input?.category ?? 'Chung',
    targetDate: input?.targetDate ?? null,
    period: input?.period ?? null,
    walletId: input?.walletId ?? null,
    transactions: Array.isArray(input?.transactions)
      ? input.transactions.map(normalizeSavingTransaction)
      : [],
  };
}

async function requestCollection<T>(path: string, normalizer: (input: any) => T) {
  const { data } = await api.get(path);

  if (!Array.isArray(data)) {
    return [] as T[];
  }

  return data.map(normalizer);
}

async function requestOptionalCollection<T>(path: string, normalizer: (input: any) => T) {
  try {
    return await requestCollection(path, normalizer);
  } catch {
    return [] as T[];
  }
}

async function requestByWallets<T>(
  walletIds: string[],
  buildPath: (walletId: string) => string,
  normalizer: (input: any) => T
) {
  const responses = await Promise.all(
    walletIds.map((walletId) => requestOptionalCollection(buildPath(walletId), normalizer))
  );

  return responses.flat();
}

export const financeService = {
  async getWallets() {
    return requestCollection('/wallet', normalizeWallet);
  },

  async getTransactions() {
    const transactions = await requestCollection('/transaction', normalizeTransaction);
    return sortTransactions(transactions);
  },

  async getDebts() {
    return requestOptionalCollection('/debts', normalizeDebt);
  },

  async getBudgetsForWallets(walletIds: string[]) {
    return requestByWallets(walletIds, (walletId) => `/budgets/${walletId}`, normalizeBudget);
  },

  async getSavingsForWallets(walletIds: string[]) {
    return requestByWallets(walletIds, (walletId) => `/savings/${walletId}`, normalizeSaving);
  },

  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    const [wallets, transactions, debts] = await Promise.all([
      financeService.getWallets(),
      financeService.getTransactions(),
      financeService.getDebts(),
    ]);

    const walletIds = wallets.map((wallet) => wallet.id);
    const [budgets, savings] = await Promise.all([
      financeService.getBudgetsForWallets(walletIds),
      financeService.getSavingsForWallets(walletIds),
    ]);

    return {
      wallets,
      transactions,
      budgets,
      debts,
      savings,
    };
  },
};
