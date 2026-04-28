import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TransactionRow } from '@/components/finance/transaction-row';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { AppTheme } from '@/constants/theme';
import { extractApiError } from '@/services/api';
import { financeService } from '@/services/finance-service';
import type { Transaction, Wallet } from '@/types/finance';
import { formatCurrency, groupTransactionsByDay } from '@/utils/format';

type TransactionFilter = 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER';

function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function TransactionsScreen() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<TransactionFilter>('ALL');
  const [activeWalletId, setActiveWalletId] = useState<'ALL' | string>('ALL');

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setError(null);
      const [nextWallets, nextTransactions] = await Promise.all([
        financeService.getWallets(),
        financeService.getTransactions(),
      ]);
      setWallets(nextWallets);
      setTransactions(nextTransactions);
    } catch (error) {
      setError(extractApiError(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTransactions = transactions.filter((transaction) => {
    if (activeType !== 'ALL' && transaction.type !== activeType) {
      return false;
    }

    if (activeWalletId !== 'ALL' && transaction.walletId !== activeWalletId) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${transaction.categoryName} ${transaction.description}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const totalIncome = filteredTransactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalExpense = filteredTransactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const groupedTransactions = groupTransactionsByDay(filteredTransactions);

  if (loading && transactions.length === 0) {
    return (
      <Screen scroll={false}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={AppTheme.colors.accent} size="large" />
          <Text style={styles.loaderText}>Đang tải danh sách giao dịch...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
      scrollProps={{
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />,
      }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Giao dịch</Text>
        <Text style={styles.subtitle}>
          Lọc theo loại, ví và từ khoá để đọc lại lịch sử chi tiêu nhanh hơn.
        </Text>
      </View>

      <SectionCard
        eyebrow="Overview"
        subtitle={error ? `Có lỗi khi tải dữ liệu: ${error}` : 'Tổng hợp trên tập giao dịch đang lọc.'}
        title="Nhịp tiền vào ra"
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng thu</Text>
            <Text style={[styles.summaryValue, { color: AppTheme.colors.success }]}>
              {formatCurrency(totalIncome, 'VND', true)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng chi</Text>
            <Text style={[styles.summaryValue, { color: AppTheme.colors.danger }]}>
              {formatCurrency(totalExpense, 'VND', true)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Số bản ghi</Text>
            <Text style={styles.summaryValue}>{filteredTransactions.length}</Text>
          </View>
        </View>
      </SectionCard>

      <View style={styles.searchWrap}>
        <Ionicons color={AppTheme.colors.muted} name="search-outline" size={18} />
        <TextInput
          onChangeText={setQuery}
          placeholder="Tìm theo danh mục hoặc mô tả"
          placeholderTextColor={AppTheme.colors.muted}
          style={styles.searchInput}
          value={query}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons color={AppTheme.colors.muted} name="close-circle" size={18} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <FilterChip active={activeType === 'ALL'} label="Tất cả" onPress={() => setActiveType('ALL')} />
          <FilterChip active={activeType === 'INCOME'} label="Thu nhập" onPress={() => setActiveType('INCOME')} />
          <FilterChip active={activeType === 'EXPENSE'} label="Chi tiêu" onPress={() => setActiveType('EXPENSE')} />
          <FilterChip active={activeType === 'TRANSFER'} label="Chuyển ví" onPress={() => setActiveType('TRANSFER')} />
        </View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <FilterChip active={activeWalletId === 'ALL'} label="Mọi ví" onPress={() => setActiveWalletId('ALL')} />
          {wallets.map((wallet) => (
            <FilterChip
              key={wallet.id}
              active={activeWalletId === wallet.id}
              label={wallet.name}
              onPress={() => setActiveWalletId(wallet.id)}
            />
          ))}
        </View>
      </ScrollView>

      {groupedTransactions.length === 0 ? (
        <EmptyState
          icon="file-tray-outline"
          message="Bộ lọc hiện tại không khớp giao dịch nào. Hãy đổi loại giao dịch hoặc bỏ bớt từ khoá."
          title="Không có dữ liệu phù hợp"
        />
      ) : (
        groupedTransactions.map((group) => (
          <SectionCard
            key={group.date}
            eyebrow={group.label}
            subtitle={`${group.items.length} giao dịch trong nhóm ngày này.`}
            title={group.date}
          >
            <View style={styles.transactionList}>
              {group.items.map((transaction) => {
                const walletName =
                  wallets.find((wallet) => wallet.id === transaction.walletId)?.name ?? '';

                return (
                  <TransactionRow
                    key={transaction.id}
                    showWallet
                    transaction={transaction}
                    walletName={walletName}
                  />
                );
              })}
            </View>
          </SectionCard>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  loaderWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loaderText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    marginTop: 14,
  },
  header: {
    gap: 6,
  },
  title: {
    color: AppTheme.colors.ink,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    gap: 6,
  },
  summaryLabel: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: AppTheme.colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.line,
    borderRadius: AppTheme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: AppTheme.colors.ink,
    flex: 1,
    fontSize: 14,
    minHeight: 54,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  filterChip: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  filterChipActive: {
    backgroundColor: AppTheme.colors.accentSoft,
    borderColor: AppTheme.colors.accent,
    borderWidth: 1,
  },
  filterChipText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: AppTheme.colors.accent,
  },
  transactionList: {
    gap: 2,
  },
});
