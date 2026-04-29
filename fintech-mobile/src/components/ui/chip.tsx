import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { AppTheme } from '@/constants/theme';

interface ChipProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  left?: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Chip({
  label,
  active = false,
  disabled = false,
  onPress,
  left,
  right,
  style,
  textStyle,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        (disabled || !onPress) && styles.chipDisabled,
        pressed && !(disabled || !onPress) && styles.chipPressed,
        style,
      ]}
    >
      {left ? <View style={styles.side}>{left}</View> : null}
      <Text style={[styles.label, active && styles.labelActive, textStyle]} numberOfLines={1}>
        {label}
      </Text>
      {right ? <View style={styles.side}>{right}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.pill,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  chipActive: {
    backgroundColor: AppTheme.colors.accentSoft,
    borderColor: AppTheme.colors.accent,
    borderWidth: 1,
  },
  chipDisabled: {
    opacity: 0.55,
  },
  chipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  label: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.semibold,
  },
  labelActive: {
    color: AppTheme.colors.accent,
  },
  side: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

