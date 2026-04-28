import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WalletCard } from '@/components/finance/wallet-card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { AppTheme } from '@/constants/theme';
import { extractApiError } from '@/services/api';
import { financeService } from '@/services/finance-service';
import type { Budget, Saving, Wallet } from '@/types/finance';
import { formatCurrency, formatPercent } from '@/utils/format';

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statLine}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function WalletsScreen() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      setError(null);
      const nextWallets = await financeService.getWallets();
      const walletIds = nextWallets.map((wallet) => wallet.id);
      const [nextBudgets, nextSavings] = await Promise.all([
        financeService.getBudgetsForWallets(walletIds),
        financeService.getSavingsForWallets(walletIds),
      ]);
      setWallets(nextWallets);
      setBudgets(nextBudgets);
      setSavings(nextSavings);
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

  const cashBalance = sum(
    wallets.filter((wallet) => wallet.type !== 'CREDIT').map((wallet) => wallet.balance)
  );
  const creditLimit = sum(wallets.map((wallet) => wallet.creditLimit));
  const creditUsed = sum(wallets.map((wallet) => wallet.unpaidBalance));
  const savingsAttached = savings.length;
  const budgetAttached = budgets.length;
  const creditUtilization = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

  if (loading && wallets.length === 0) {
    return (
      <Screen scroll={false}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={AppTheme.colors.accent} size="large" />
          <Text style={styles.loaderText}>Đang tải thông tin ví...</Text>
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
        subtitle="Mỗi ví hiển thị theo đúng bản chất: tiền mặt là số dư, thẻ tín dụng là hạn mức và dư nợ."
        title="Ví và tài sản"
      />

      <SectionCard
        eyebrow="Portfolio"
        subtitle={error ? `Có lỗi khi tải dữ liệu: ${error}` : 'Tổng hợp theo toàn bộ ví trong tài khoản.'}
        title="Cấu trúc tài sản"
      >
        <StatLine label="Tiền mặt khả dụng" value={formatCurrency(cashBalance, 'VND', true)} />
        <StatLine label="Hạn mức tín dụng" value={formatCurrency(creditLimit, 'VND', true)} />
        <StatLine label="Dư nợ đang dùng" value={formatCurrency(creditUsed, 'VND', true)} />
        <View style={styles.progressBlock}>
          <Text style={styles.progressLabel}>Tỷ lệ sử dụng tín dụng</Text>
          <Text style={styles.progressValue}>{formatPercent(creditUtilization)}</Text>
        </View>
        <ProgressBar color={AppTheme.colors.gold} value={creditUtilization} />
      </SectionCard>

      <SectionCard
        eyebrow="Attached plans"
        subtitle="Cho biết số mục tiêu tiết kiệm và ngân sách đang gắn trực tiếp lên các ví hiện có."
        title="Ràng buộc theo ví"
      >
        <StatLine label="Ngân sách gắn ví" value={String(budgetAttached)} />
        <StatLine label="Mục tiêu tiết kiệm" value={String(savingsAttached)} />
      </SectionCard>

      {wallets.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          message="Hiện chưa có ví nào từ backend. Khi dữ liệu xuất hiện, phần phân bổ và thẻ ví sẽ hiển thị ở đây."
          title="Chưa có ví"
        />
      ) : (
        <View style={styles.walletColumn}>
          {wallets.map((wallet) => {
            const relatedBudgets = budgets.filter((budget) => budget.walletId === wallet.id).length;
            const relatedSavings = savings.filter((saving) => saving.walletId === wallet.id).length;

            return (
              <View key={wallet.id} style={styles.walletBlock}>
                <WalletCard wallet={wallet} />
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>{relatedBudgets} ngân sách</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>{relatedSavings} mục tiêu</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
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
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.semibold,
  },
  statValue: {
    color: AppTheme.colors.ink,
    fontSize: 13,
    fontFamily: AppTheme.fonts.extrabold,
  },
  progressBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 8,
  },
  progressLabel: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.semibold,
  },
  progressValue: {
    color: AppTheme.colors.ink,
    fontSize: 13,
    fontFamily: AppTheme.fonts.extrabold,
  },
  walletColumn: {
    gap: 14,
  },
  walletBlock: {
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaChip: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  metaChipText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 12,
    fontFamily: AppTheme.fonts.semibold,
  },
});
