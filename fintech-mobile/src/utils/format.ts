import type { Transaction, Wallet } from '@/types/finance';

function normalizeAmount(amount: number | null | undefined) {
  return Number.isFinite(amount) ? Number(amount) : 0;
}

export function formatCurrency(
  amount: number | null | undefined,
  currency = 'VND',
  compact = false
) {
  const value = normalizeAmount(amount);

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  const normalized = normalizeAmount(value);
  return `${Math.round(normalized)}%`;
}

export function clampPercentage(value: number | null | undefined) {
  const normalized = normalizeAmount(value);
  return Math.max(0, Math.min(100, normalized));
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return 'Chưa xác định';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatRelativeDate(value: string | null | undefined) {
  if (!value) {
    return 'Không có ngày';
  }

  const target = new Date(value);
  const now = new Date();
  const diffDays = Math.round((target.getTime() - now.getTime()) / 86_400_000);

  if (diffDays === 0) {
    return 'Hôm nay';
  }

  if (diffDays === -1) {
    return 'Hôm qua';
  }

  if (diffDays === 1) {
    return 'Ngày mai';
  }

  if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays} ngày nữa`;
  }

  if (diffDays < -1 && diffDays >= -7) {
    return `${Math.abs(diffDays)} ngày trước`;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
  }).format(target);
}

export function getInitials(value: string | null | undefined) {
  if (!value) {
    return 'FT';
  }

  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('');
}

export function getWalletBalance(wallet: Wallet) {
  if (wallet.type === 'CREDIT') {
    return wallet.creditLimit - wallet.unpaidBalance;
  }

  return wallet.balance;
}

export function getWalletSubtitle(wallet: Wallet) {
  if (wallet.type === 'CREDIT') {
    return `Dư nợ ${formatCurrency(wallet.unpaidBalance, wallet.currency)}`;
  }

  return `Số dư ${formatCurrency(wallet.balance, wallet.currency)}`;
}

export function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function groupTransactionsByDay(transactions: Transaction[]) {
  const grouped = new Map<string, Transaction[]>();

  for (const transaction of sortTransactions(transactions)) {
    const key = transaction.createdAt.split('T')[0] ?? transaction.createdAt;
    const bucket = grouped.get(key) ?? [];
    bucket.push(transaction);
    grouped.set(key, bucket);
  }

  return Array.from(grouped.entries()).map(([date, items]) => ({
    date,
    label: formatRelativeDate(date),
    items,
  }));
}
