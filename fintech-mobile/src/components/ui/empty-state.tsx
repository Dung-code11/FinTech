import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/theme';

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  message,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons color={AppTheme.colors.accent} name={icon} size={20} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.line,
    borderRadius: AppTheme.radii.lg,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.accentSoft,
    borderRadius: AppTheme.radii.pill,
    height: 44,
    justifyContent: 'center',
    marginBottom: 12,
    width: 44,
  },
  title: {
    color: AppTheme.colors.ink,
    fontSize: 15,
    fontFamily: AppTheme.fonts.semibold,
    marginBottom: 4,
  },
  message: {
    color: AppTheme.colors.muted,
    fontSize: 13,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 20,
    textAlign: 'center',
  },
});
