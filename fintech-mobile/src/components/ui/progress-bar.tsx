import { StyleSheet, View } from 'react-native';

import { AppTheme } from '@/constants/theme';
import { clampPercentage } from '@/utils/format';

interface ProgressBarProps {
  value: number;
  color?: string;
}

export function ProgressBar({ value, color = AppTheme.colors.accent }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clampPercentage(value)}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: AppTheme.colors.surfaceStrong,
    borderRadius: AppTheme.radii.pill,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: AppTheme.radii.pill,
    height: '100%',
  },
});
