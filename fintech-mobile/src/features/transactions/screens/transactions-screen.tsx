import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TransactionRow } from '@/components/finance/transaction-row';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { SearchField } from '@/components/ui/search-field';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { AppTheme } from '@/constants/theme';
import { extractApiError } from '@/services/api';
import { financeService } from '@/services/finance-service';
import type { Transaction, Wallet } from '@/types/finance';
import { formatCurrency, groupTransactionsByDay } from '@/utils/format';

type TransactionFilter = 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER';

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
      <PageHeader
        subtitle="Lọc theo loại, ví và từ khoá để đọc lại lịch sử chi tiêu nhanh hơn."
        title="Giao dịch"
      />

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

      <SearchField
        onChangeText={setQuery}
        placeholder="Tìm theo danh mục hoặc mô tả"
        value={query}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <Chip active={activeType === 'ALL'} label="Tất cả" onPress={() => setActiveType('ALL')} />
          <Chip active={activeType === 'INCOME'} label="Thu nhập" onPress={() => setActiveType('INCOME')} />
          <Chip active={activeType === 'EXPENSE'} label="Chi tiêu" onPress={() => setActiveType('EXPENSE')} />
          <Chip active={activeType === 'TRANSFER'} label="Chuyển ví" onPress={() => setActiveType('TRANSFER')} />
        </View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <Chip active={activeWalletId === 'ALL'} label="Mọi ví" onPress={() => setActiveWalletId('ALL')} />
          {wallets.map((wallet) => (
            <Chip
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
    fontFamily: AppTheme.fonts.regular,
    marginTop: 14,
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
    fontFamily: AppTheme.fonts.semibold,
  },
  summaryValue: {
    color: AppTheme.colors.ink,
    fontSize: 16,
    fontFamily: AppTheme.fonts.extrabold,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  transactionList: {
    gap: 2,
  },
});
