import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
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
}

export function FormField({ label, icon, rightElement, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Ionicons color={AppTheme.colors.accent} name={icon} size={18} />
        <TextInput
          placeholderTextColor={AppTheme.colors.muted}
          style={[styles.input, style]}
          {...props}
        />
        {rightElement}
      </View>
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
    fontWeight: '700',
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
  input: {
    color: AppTheme.colors.ink,
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
});
