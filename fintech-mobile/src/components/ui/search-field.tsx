import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppTheme } from '@/constants/theme';

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  icon?: ComponentProps<typeof Ionicons>['name'];
  onClear?: () => void;
  autoFocus?: boolean;
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
  style,
  icon = 'search-outline',
  onClear,
  autoFocus = false,
}: SearchFieldProps) {
  const canClear = Boolean(value);

  return (
    <View style={[styles.wrap, style]}>
      <Ionicons color={AppTheme.colors.muted} name={icon} size={18} />
      <TextInput
        autoFocus={autoFocus}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppTheme.colors.muted}
        style={styles.input}
        value={value}
      />
      {canClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={onClear ?? (() => onChangeText(''))}
          hitSlop={10}
        >
          <Ionicons color={AppTheme.colors.muted} name="close-circle" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.line,
    borderRadius: AppTheme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  input: {
    color: AppTheme.colors.ink,
    flex: 1,
    fontSize: 14,
    fontFamily: AppTheme.fonts.regular,
    minHeight: 54,
  },
});

