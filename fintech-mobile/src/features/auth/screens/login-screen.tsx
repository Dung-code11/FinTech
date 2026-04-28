import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FormField } from '@/components/ui/form-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { AppTheme } from '@/constants/theme';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { useAuth } from '@/hooks/useAuth';
import { extractApiError } from '@/services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!login.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn({
        login: login.trim(),
        password,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', extractApiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      badge="Đăng nhập"
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Tạo mới</Text>
          </TouchableOpacity>
        </View>
      }
      subtitle="Đăng nhập để xem bảng điều khiển, ví và toàn bộ nhịp giao dịch của bạn."
      title="Quay lại với dòng tiền của bạn"
    >
      <FormField
        autoCapitalize="none"
        icon="person-outline"
        label="Tên đăng nhập hoặc email"
        onChangeText={setLogin}
        placeholder="vd: minhduc hoặc me@example.com"
        value={login}
      />

      <FormField
        icon="lock-closed-outline"
        label="Mật khẩu"
        onChangeText={setPassword}
        placeholder="Nhập mật khẩu"
        secureTextEntry={!showPassword}
        value={password}
        rightElement={
          <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
            <Ionicons
              color={AppTheme.colors.muted}
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
            />
          </TouchableOpacity>
        }
      />

      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            'Chưa nối luồng quên mật khẩu',
            'Backend đã có API, nhưng mobile app hiện đang ưu tiên luồng đăng nhập, dashboard và quản lý ví.'
          )
        }>
        <Text style={styles.helperLink}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <PrimaryButton
        icon="arrow-forward"
        label="Vào ứng dụng"
        loading={submitting}
        onPress={() => void handleSubmit()}
      />

      <View style={styles.noteBlock}>
        <Text style={styles.noteTitle}>Luồng hiện có</Text>
        <Text style={styles.noteText}>Onboarding, đăng ký, đăng nhập, dashboard tổng quan, giao dịch, ví, công cụ và cài đặt.</Text>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  helperLink: {
    alignSelf: 'flex-end',
    color: AppTheme.colors.accent,
    fontSize: 13,
    fontFamily: AppTheme.fonts.bold,
    marginTop: -4,
  },
  noteBlock: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.md,
    gap: 6,
    padding: 14,
  },
  noteTitle: {
    color: AppTheme.colors.ink,
    fontSize: 13,
    fontFamily: AppTheme.fonts.extrabold,
  },
  noteText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 20,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  footerText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    fontFamily: AppTheme.fonts.regular,
  },
  footerLink: {
    color: AppTheme.colors.accent,
    fontSize: 14,
    fontFamily: AppTheme.fonts.extrabold,
  },
});
