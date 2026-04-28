import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, subtitle, right, eyebrow }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    color: AppTheme.colors.accent,
    fontSize: 11,
    fontFamily: AppTheme.fonts.bold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    color: AppTheme.colors.ink,
    fontSize: 30,
    fontFamily: AppTheme.fonts.extrabold,
    lineHeight: 36,
  },
  subtitle: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 22,
  },
});

