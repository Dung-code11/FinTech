import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/theme';

interface SectionCardProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({
  eyebrow,
  title,
  subtitle,
  action,
  children,
}: SectionCardProps) {
  return (
    <View style={styles.card}>
      {eyebrow || title || subtitle || action ? (
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.line,
    borderRadius: AppTheme.radii.lg,
    borderWidth: 1,
    padding: 18,
    ...AppTheme.shadow.soft,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: AppTheme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    color: AppTheme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
