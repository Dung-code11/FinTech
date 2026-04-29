import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Chip } from '@/components/ui/chip';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { AppTheme } from '@/constants/theme';
import { convertCurrency, currencyRates, financePrompts } from '@/services/tools-service';
import { formatCurrency } from '@/utils/format';

export default function ToolsScreen() {
  const [amount, setAmount] = useState('1000000');
  const [fromCode, setFromCode] = useState('VND');
  const [toCode, setToCode] = useState('USD');
  const hasRates = currencyRates.length > 0;

  const numericAmount = Number(amount) || 0;
  const converted = hasRates ? convertCurrency(numericAmount, fromCode, toCode) : 0;

  return (
    <Screen contentContainerStyle={styles.content}>
      <PageHeader
        subtitle="Khu vực hỗ trợ quyết định nhanh trên mobile. Tỷ giá sẽ hiển thị khi ứng dụng được kết nối nguồn dữ liệu thật."
        title="Công cụ & insight"
      />

      <SectionCard
        eyebrow="Converter"
        subtitle="Bộ chuyển đổi sẽ khả dụng khi có feed tỷ giá thật."
        title="Bộ chuyển đổi tiền tệ"
      >
        {hasRates ? (
          <>
            <View style={styles.converterBlock}>
              <Text style={styles.converterLabel}>Số tiền nguồn</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={AppTheme.colors.muted}
                style={styles.amountInput}
                value={amount}
              />
            </View>

            <Text style={styles.selectorLabel}>Đổi từ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {currencyRates.map((rate) => (
                  <Chip
                    key={`from-${rate.code}`}
                    active={fromCode === rate.code}
                    label={rate.code}
                    onPress={() => setFromCode(rate.code)}
                  />
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                setFromCode(toCode);
                setToCode(fromCode);
              }}
              style={styles.swapButton}>
              <Ionicons color={AppTheme.colors.accent} name="swap-vertical-outline" size={20} />
            </TouchableOpacity>

            <Text style={styles.selectorLabel}>Đổi sang</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {currencyRates.map((rate) => (
                  <Chip
                    key={`to-${rate.code}`}
                    active={toCode === rate.code}
                    label={rate.code}
                    onPress={() => setToCode(rate.code)}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.resultBlock}>
              <Text style={styles.resultLabel}>Kết quả</Text>
              <Text style={styles.resultValue}>
                {formatCurrency(converted, toCode, true)}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons color={AppTheme.colors.muted} name="cloud-offline-outline" size={20} />
            <Text style={styles.emptyStateText}>
              Chưa có nguồn tỷ giá trực tiếp. Màn hình này sẽ hiển thị khi backend hoặc provider tỷ giá được kết nối.
            </Text>
          </View>
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Market board"
        subtitle="Bảng tỷ giá sẽ mở khi có dữ liệu thật."
        title="Bảng tỷ giá tham khảo"
      >
        {hasRates ? (
          <View style={styles.rateGrid}>
            {currencyRates.map((rate) => (
              <View key={rate.code} style={styles.rateCard}>
                <View style={styles.rateCardTop}>
                  <Text style={styles.rateCode}>{rate.code}</Text>
                  <Text
                    style={[
                      styles.rateChange,
                      { color: rate.dailyChange >= 0 ? AppTheme.colors.success : AppTheme.colors.danger },
                    ]}>
                    {rate.dailyChange >= 0 ? '+' : ''}
                    {rate.dailyChange}%
                  </Text>
                </View>
                <Text style={styles.rateName}>{rate.name}</Text>
                <Text style={styles.rateValue}>
                  {rate.code === 'USD' ? '1.00' : rate.usdRate.toLocaleString('vi-VN')}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons color={AppTheme.colors.muted} name="bar-chart-outline" size={20} />
            <Text style={styles.emptyStateText}>
              Chưa có dữ liệu tỷ giá để hiển thị bảng tham chiếu.
            </Text>
          </View>
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Prompts"
        subtitle="Những gợi ý ngắn để đọc lại dữ liệu tài chính trong app hiệu quả hơn."
        title="Mẹo dùng màn hình mobile"
      >
        <View style={styles.promptList}>
          {financePrompts.map((prompt) => (
            <View key={prompt} style={styles.promptRow}>
              <Ionicons color={AppTheme.colors.accent} name="flash-outline" size={16} />
              <Text style={styles.promptText}>{prompt}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  converterBlock: {
    gap: 8,
  },
  converterLabel: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.semibold,
  },
  amountInput: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.lg,
    color: AppTheme.colors.ink,
    fontSize: 30,
    fontFamily: AppTheme.fonts.extrabold,
    minHeight: 72,
    paddingHorizontal: 18,
  },
  selectorLabel: {
    color: AppTheme.colors.ink,
    fontSize: 13,
    fontFamily: AppTheme.fonts.semibold,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  swapButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  resultBlock: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.lg,
    gap: 8,
    marginTop: 4,
    padding: 18,
  },
  resultLabel: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.semibold,
  },
  resultValue: {
    color: AppTheme.colors.ink,
    fontSize: 28,
    fontFamily: AppTheme.fonts.extrabold,
  },
  rateGrid: {
    gap: 12,
  },
  rateCard: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.md,
    gap: 4,
    padding: 14,
  },
  rateCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateCode: {
    color: AppTheme.colors.ink,
    fontSize: 16,
    fontFamily: AppTheme.fonts.extrabold,
  },
  rateChange: {
    fontSize: 12,
    fontFamily: AppTheme.fonts.extrabold,
  },
  rateName: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.regular,
  },
  rateValue: {
    color: AppTheme.colors.ink,
    fontSize: 15,
    fontFamily: AppTheme.fonts.semibold,
  },
  promptList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.lg,
    gap: 10,
    padding: 18,
  },
  emptyStateText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 20,
    textAlign: 'center',
  },
  promptRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  promptText: {
    color: AppTheme.colors.inkSoft,
    flex: 1,
    fontSize: 13,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 21,
  },
});
