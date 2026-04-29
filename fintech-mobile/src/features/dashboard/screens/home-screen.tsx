import { LinearGradient } from 'expo-linear-gradient';
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
import { WalletCard } from '@/components/finance/wallet-card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { AppTheme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { extractApiError } from '@/services/api';
import { financeService } from '@/services/finance-service';
import type { DashboardSnapshot } from '@/types/finance';
import {
  formatCurrency,
  formatPercent,
  getInitials,
} from '@/utils/format';

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  wallets: [],
  transactions: [],
  budgets: [],
  debts: [],
  savings: [],
};

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function MetricTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHelper}>{helper}</Text>
    </View>
  );
}

function InsightRow({
  color,
  label,
  value,
  progress,
}: {
  color: string;
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <View style={styles.insightRow}>
      <View style={styles.insightCopy}>
        <Text style={styles.insightLabel}>{label}</Text>
        <Text style={styles.insightValue}>{value}</Text>
      </View>
      <View style={styles.insightBar}>
        <ProgressBar color={color} value={progress} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setError(null);
      const nextSnapshot = await financeService.getDashboardSnapshot();
      setSnapshot(nextSnapshot);
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

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthTransactions = snapshot.transactions.filter((transaction) => {
    const date = new Date(transaction.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthIncome = sum(
    monthTransactions
      .filter((transaction) => transaction.type === 'INCOME')
      .map((transaction) => transaction.amount)
  );
  const monthExpense = sum(
    monthTransactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .map((transaction) => transaction.amount)
  );
  const cashBalance = sum(
    snapshot.wallets
      .filter((wallet) => wallet.type !== 'CREDIT')
      .map((wallet) => wallet.balance)
  );
  const creditUsed = sum(snapshot.wallets.map((wallet) => wallet.unpaidBalance));
  const savingsCurrent = sum(snapshot.savings.map((saving) => saving.currentAmount));
  const savingsTarget = sum(snapshot.savings.map((saving) => saving.targetAmount));
  const savingsProgress = savingsTarget > 0 ? (savingsCurrent / savingsTarget) * 100 : 0;
  const outstandingDebt = sum(snapshot.debts.map((debt) => debt.remainingAmount));
  const topBudget = [...snapshot.budgets].sort((left, right) => right.progress - left.progress)[0];
  const topSaving = [...snapshot.savings].sort((left, right) => right.progress - left.progress)[0];

  if (loading && snapshot.wallets.length === 0 && snapshot.transactions.length === 0) {
    return (
      <Screen scroll={false}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={AppTheme.colors.accent} size="large" />
          <Text style={styles.loaderText}>Đang tải toàn cảnh tài chính...</Text>
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
        eyebrow="FinTrack mobile"
        subtitle="Một màn hình để nhìn ví, kỷ luật chi tiêu và các khoản đang kéo dòng tiền đi xuống."
        title={`Xin chào, ${user?.username ?? 'bạn'}`}
        right={
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.username)}</Text>
          </View>
        }
      />

      <LinearGradient colors={AppTheme.gradients.hero} style={styles.heroCard}>
        <Text style={styles.heroLabel}>Vốn khả dụng</Text>
        <Text style={styles.heroValue}>{formatCurrency(cashBalance - creditUsed)}</Text>
        <View style={styles.heroSplit}>
          <View style={styles.heroSplitItem}>
            <Text style={styles.heroSplitLabel}>Thu tháng này</Text>
            <Text style={styles.heroSplitValue}>{formatCurrency(monthIncome, 'VND', true)}</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroSplitItem}>
            <Text style={styles.heroSplitLabel}>Chi tháng này</Text>
            <Text style={styles.heroSplitValue}>{formatCurrency(monthExpense, 'VND', true)}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.metricGrid}>
        <MetricTile
          helper={`${snapshot.wallets.length} ví đang hoạt động`}
          label="Tiền mặt"
          value={formatCurrency(cashBalance, 'VND', true)}
        />
        <MetricTile
          helper={`${snapshot.debts.length} khoản công nợ`}
          label="Dư nợ mở"
          value={formatCurrency(outstandingDebt, 'VND', true)}
        />
        <MetricTile
          helper={`${snapshot.savings.length} mục tiêu`}
          label="Tiết kiệm"
          value={formatPercent(savingsProgress)}
        />
        <MetricTile
          helper={`${snapshot.transactions.length} giao dịch gần nhất`}
          label="Nhịp giao dịch"
          value={formatCurrency(monthIncome - monthExpense, 'VND', true)}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ví đang hoạt động</Text>
        <Text style={styles.sectionCaption}>Nhìn nhanh theo loại ví và mức sử dụng.</Text>
      </View>

      {snapshot.wallets.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          message="Hiện chưa có ví nào để hiển thị. Khi backend trả dữ liệu, phần này sẽ tự cập nhật."
          title="Chưa có dữ liệu ví"
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.walletRow}>
            {snapshot.wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </View>
        </ScrollView>
      )}

      <SectionCard
        eyebrow="Discipline"
        subtitle="Tổng hợp hai tín hiệu quan trọng nhất từ ngân sách và mục tiêu tiết kiệm."
        title="Kỷ luật tài chính"
      >
        {topBudget ? (
          <InsightRow
            color={AppTheme.colors.danger}
            label={`Ngân sách nóng nhất • ${topBudget.budgetName}`}
            progress={topBudget.progress}
            value={`${formatCurrency(topBudget.spent)} / ${formatCurrency(topBudget.amount)}`}
          />
        ) : (
          <EmptyState
            icon="pie-chart-outline"
            message="Chưa có ngân sách nào được backend trả về."
            title="Ngân sách trống"
          />
        )}

        {topSaving ? (
          <InsightRow
            color={AppTheme.colors.success}
            label={`Mục tiêu nổi bật • ${topSaving.title}`}
            progress={topSaving.progress}
            value={`${formatCurrency(topSaving.currentAmount)} / ${formatCurrency(topSaving.targetAmount)}`}
          />
        ) : (
          <View style={styles.spacer} />
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Recent activity"
        subtitle={error ? `Dữ liệu có lỗi: ${error}` : 'Những giao dịch mới nhất trên toàn bộ tài khoản.'}
        title="Giao dịch gần đây"
      >
        {snapshot.transactions.length === 0 ? (
          <EmptyState
            icon="swap-horizontal-outline"
            message="Chưa có giao dịch để tóm tắt trong mobile app."
            title="Không có giao dịch"
          />
        ) : (
          <View style={styles.transactionList}>
            {snapshot.transactions.slice(0, 5).map((transaction) => {
              const walletName =
                snapshot.wallets.find((wallet) => wallet.id === transaction.walletId)?.name ?? '';

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
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  loaderWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loaderText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    fontFamily: AppTheme.fonts.regular,
    marginTop: 14,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.line,
    borderRadius: AppTheme.radii.pill,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarText: {
    color: AppTheme.colors.ink,
    fontSize: 16,
    fontFamily: AppTheme.fonts.extrabold,
  },
  heroCard: {
    borderRadius: AppTheme.radii.xl,
    padding: 22,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontFamily: AppTheme.fonts.semibold,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontFamily: AppTheme.fonts.extrabold,
    marginBottom: 22,
  },
  heroSplit: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  heroSplitItem: {
    flex: 1,
    gap: 6,
  },
  heroSplitLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontFamily: AppTheme.fonts.medium,
  },
  heroSplitValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: AppTheme.fonts.semibold,
  },
  heroDivider: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    height: 32,
    width: 1,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricTile: {
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.line,
    borderRadius: AppTheme.radii.lg,
    borderWidth: 1,
    minHeight: 120,
    padding: 16,
    width: '48%',
    ...AppTheme.shadow.soft,
  },
  metricLabel: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    fontFamily: AppTheme.fonts.semibold,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: AppTheme.colors.ink,
    fontSize: 20,
    fontFamily: AppTheme.fonts.extrabold,
    marginBottom: 8,
  },
  metricHelper: {
    color: AppTheme.colors.inkSoft,
    fontSize: 12,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 18,
  },
  sectionHeader: {
    gap: 4,
    marginTop: 4,
  },
  sectionTitle: {
    color: AppTheme.colors.ink,
    fontSize: 21,
    fontFamily: AppTheme.fonts.extrabold,
  },
  sectionCaption: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 20,
  },
  walletRow: {
    flexDirection: 'row',
    gap: 14,
    paddingRight: 20,
  },
  insightRow: {
    gap: 10,
    marginBottom: 16,
  },
  insightCopy: {
    gap: 4,
  },
  insightLabel: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.semibold,
  },
  insightValue: {
    color: AppTheme.colors.ink,
    fontSize: 16,
    fontFamily: AppTheme.fonts.extrabold,
  },
  insightBar: {
    marginTop: 2,
  },
  spacer: {
    height: 4,
  },
  transactionList: {
    gap: 2,
  },
});
