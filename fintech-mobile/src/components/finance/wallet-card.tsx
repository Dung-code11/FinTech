import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/theme';
import type { Wallet } from '@/types/finance';
import { formatCurrency, formatShortDate, getWalletBalance, getWalletSubtitle } from '@/utils/format';

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const isCredit = wallet.type === 'CREDIT';
  const accent = isCredit ? AppTheme.colors.gold : AppTheme.colors.accent;
  const softAccent = isCredit ? AppTheme.colors.goldSoft : AppTheme.colors.accentSoft;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: softAccent }]}>
          <Ionicons
            color={accent}
            name={isCredit ? 'card-outline' : 'wallet-outline'}
            size={18}
          />
        </View>
        <Text style={[styles.typePill, { color: accent }]}>
          {isCredit ? 'Tín dụng' : 'Tiền mặt'}
        </Text>
      </View>

      <Text numberOfLines={1} style={styles.name}>
        {wallet.name}
      </Text>
      <Text style={styles.balance}>{formatCurrency(getWalletBalance(wallet), wallet.currency, true)}</Text>
      <Text style={styles.subtitle}>{getWalletSubtitle(wallet)}</Text>

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Tiền tệ {wallet.currency}</Text>
        {wallet.expiryDate ? <Text style={styles.footerLabel}>Đến hạn {formatShortDate(wallet.expiryDate)}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.line,
    borderRadius: AppTheme.radii.lg,
    borderWidth: 1,
    minWidth: 240,
    padding: 18,
    ...AppTheme.shadow.soft,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  badge: {
    alignItems: 'center',
    borderRadius: AppTheme.radii.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  typePill: {
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    color: AppTheme.colors.ink,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  balance: {
    color: AppTheme.colors.ink,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    borderTopColor: AppTheme.colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
  },
  footerLabel: {
    color: AppTheme.colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
});
