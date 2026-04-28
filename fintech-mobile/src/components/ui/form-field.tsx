import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type ReactNode,
  type TextInputProps,
} from 'react-native';

import { AppTheme } from '@/constants/theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  rightElement?: ReactNode;
  helperText?: string;
  errorText?: string;
}

export function FormField({
  label,
  icon,
  rightElement,
  helperText,
  errorText,
  style,
  onFocus,
  onBlur,
  ...props
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);

  const fieldStyle = useMemo(
    () => [
      styles.field,
      focused && styles.fieldFocused,
      hasError && styles.fieldError,
    ],
    [focused, hasError]
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={fieldStyle}>
        <Ionicons color={AppTheme.colors.accent} name={icon} size={18} />
        <TextInput
          placeholderTextColor={AppTheme.colors.muted}
          style={[styles.input, style]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {rightElement}
      </View>
      {hasError ? <Text style={styles.errorText}>{errorText}</Text> : null}
      {!hasError && helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: AppTheme.colors.ink,
    fontSize: 13,
    fontFamily: AppTheme.fonts.semibold,
    marginLeft: 4,
  },
  field: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.line,
    borderRadius: AppTheme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  fieldFocused: {
    borderColor: AppTheme.colors.accent,
  },
  fieldError: {
    borderColor: AppTheme.colors.danger,
  },
  input: {
    color: AppTheme.colors.ink,
    flex: 1,
    fontSize: 15,
    fontFamily: AppTheme.fonts.regular,
    paddingVertical: 14,
  },
  helperText: {
    color: AppTheme.colors.muted,
    fontSize: 12,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 18,
    marginLeft: 4,
  },
  errorText: {
    color: AppTheme.colors.danger,
    fontSize: 12,
    fontFamily: AppTheme.fonts.medium,
    lineHeight: 18,
    marginLeft: 4,
  },
});
