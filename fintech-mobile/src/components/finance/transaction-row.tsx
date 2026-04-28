import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/theme';
import type { Transaction } from '@/types/finance';
import { formatCurrency, formatRelativeDate } from '@/utils/format';

interface TransactionRowProps {
  transaction: Transaction;
  walletName?: string;
  showWallet?: boolean;
}

function getTransactionMeta(type: Transaction['type']) {
  if (type === 'INCOME') {
    return {
      icon: 'arrow-up-outline' as const,
      color: AppTheme.colors.success,
      soft: AppTheme.colors.successSoft,
      prefix: '+',
    };
  }

  if (type === 'TRANSFER') {
    return {
      icon: 'repeat-outline' as const,
      color: AppTheme.colors.gold,
      soft: AppTheme.colors.goldSoft,
      prefix: '',
    };
  }

  return {
    icon: 'arrow-down-outline' as const,
    color: AppTheme.colors.danger,
    soft: AppTheme.colors.dangerSoft,
    prefix: '-',
  };
}

export function TransactionRow({
  transaction,
  walletName,
  showWallet = false,
}: TransactionRowProps) {
  const meta = getTransactionMeta(transaction.type);
  const title = transaction.categoryName || transaction.description || 'Giao dịch';
  const description = transaction.description || 'Không có ghi chú';

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: meta.soft }]}>
        <Ionicons color={meta.color} name={meta.icon} size={16} />
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.description}>
          {showWallet && walletName ? `${walletName} • ${description}` : description}
        </Text>
      </View>

      <View style={styles.amountWrap}>
        <Text style={[styles.amount, { color: meta.color }]}>
          {meta.prefix}
          {formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.date}>{formatRelativeDate(transaction.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: AppTheme.radii.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: AppTheme.colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: AppTheme.colors.muted,
    fontSize: 12,
  },
  amountWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
  },
  date: {
    color: AppTheme.colors.muted,
    fontSize: 11,
  },
});
