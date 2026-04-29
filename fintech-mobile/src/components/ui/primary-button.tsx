import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ReactNode,
} from 'react-native';

import { AppTheme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ComponentProps<typeof Ionicons>['name'];
  variant?: ButtonVariant;
  accessory?: ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = 'primary',
  accessory,
}: PrimaryButtonProps) {
  const isPrimary = variant === 'primary';
  const textColor = isPrimary ? '#FFFFFF' : AppTheme.colors.ink;

  const content = (
    <View style={[styles.content, !isPrimary && styles.flatContent]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <Ionicons color={textColor} name={icon} size={18} /> : null}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          {accessory}
        </>
      )}
    </View>
  );

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'ghost' && styles.ghostButton,
        (disabled || loading) && styles.disabled,
        pressed && !(disabled || loading) && styles.pressed,
      ]}
    >
      {isPrimary ? (
        <LinearGradient colors={AppTheme.gradients.action} style={styles.gradient}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: AppTheme.radii.pill,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
  },
  gradient: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  flatContent: {
    minHeight: 56,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: AppTheme.fonts.bold,
  },
  secondaryButton: {
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.line,
    borderWidth: 1,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
});
