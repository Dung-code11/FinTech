import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { FormField } from '@/components/ui/form-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { AppTheme } from '@/constants/theme';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { authService } from '@/services/auth-service';
import { extractApiError } from '@/services/api';
import type { Sex } from '@/types/auth';
import { formatShortDate } from '@/utils/format';

const sexOptions: Array<{ label: string; value: Sex }> = [
  { label: 'Nam', value: 'NAM' },
  { label: 'Nữ', value: 'NU' },
] as const;

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sex, setSex] = useState<Sex>('NAM');
  const [birthday, setBirthday] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validateForm() {
    if (
      !username.trim() ||
      !fullname.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !password ||
      !confirmPassword
    ) {
      return 'Vui lòng điền đủ các trường bắt buộc.';
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return 'Email chưa đúng định dạng.';
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return 'Số điện thoại phải đủ 10 chữ số.';
    }

    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (password !== confirmPassword) {
      return 'Mật khẩu xác nhận chưa khớp.';
    }

    return null;
  }

  async function handleSubmit() {
    const validationMessage = validateForm();

    if (validationMessage) {
      Alert.alert('Dữ liệu chưa hợp lệ', validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      await authService.register({
        username: username.trim(),
        password,
        fullname: fullname.trim(),
        birthday: birthday.toISOString().split('T')[0] ?? '',
        sex,
        address: address.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      });

      Alert.alert('Tạo tài khoản thành công', 'Bạn có thể đăng nhập ngay bằng tài khoản vừa tạo.', [
        {
          text: 'Đăng nhập',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
    } catch (error) {
      Alert.alert('Đăng ký thất bại', extractApiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      badge="Tạo tài khoản"
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Đã có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      }
      subtitle="Form đăng ký bám đúng payload backend để tránh phải sửa lại mapping khi tích hợp."
      title="Tạo tài khoản cho FinTrack Mobile"
    >
      <FormField
        autoCapitalize="none"
        icon="person-outline"
        label="Tên đăng nhập"
        onChangeText={setUsername}
        placeholder="minhduc"
        value={username}
      />

      <FormField
        icon="people-outline"
        label="Họ và tên"
        onChangeText={setFullname}
        placeholder="Nguyễn Minh Đức"
        value={fullname}
      />

      <FormField
        autoCapitalize="none"
        icon="mail-outline"
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="me@example.com"
        value={email}
      />

      <FormField
        icon="call-outline"
        keyboardType="phone-pad"
        label="Số điện thoại"
        maxLength={10}
        onChangeText={setPhone}
        placeholder="0912345678"
        value={phone}
      />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.pickerField}>
        <Text style={styles.pickerLabel}>Ngày sinh</Text>
        <View style={styles.pickerInput}>
          <Ionicons color={AppTheme.colors.accent} name="calendar-outline" size={18} />
          <Text style={styles.pickerValue}>{formatShortDate(birthday.toISOString())}</Text>
          <Ionicons color={AppTheme.colors.muted} name="chevron-down-outline" size={18} />
        </View>
      </TouchableOpacity>

      {showDatePicker ? (
        <DateTimePicker
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          mode="date"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setBirthday(selectedDate);
            }
          }}
          value={birthday}
        />
      ) : null}

      <View style={styles.sexWrap}>
        <Text style={styles.pickerLabel}>Giới tính</Text>
        <View style={styles.sexRow}>
          {sexOptions.map((option) => {
            const active = sex === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSex(option.value)}
                style={[styles.sexChip, active && styles.sexChipActive]}>
                <Text style={[styles.sexChipText, active && styles.sexChipTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FormField
        icon="location-outline"
        label="Địa chỉ"
        onChangeText={setAddress}
        placeholder="Quận, thành phố"
        value={address}
      />

      <FormField
        icon="lock-closed-outline"
        label="Mật khẩu"
        onChangeText={setPassword}
        placeholder="Tối thiểu 6 ký tự"
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

      <FormField
        icon="shield-checkmark-outline"
        label="Xác nhận mật khẩu"
        onChangeText={setConfirmPassword}
        placeholder="Nhập lại mật khẩu"
        secureTextEntry={!showConfirmPassword}
        value={confirmPassword}
        rightElement={
          <TouchableOpacity onPress={() => setShowConfirmPassword((value) => !value)}>
            <Ionicons
              color={AppTheme.colors.muted}
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
            />
          </TouchableOpacity>
        }
      />

      <PrimaryButton
        icon="person-add-outline"
        label="Tạo tài khoản"
        loading={submitting}
        onPress={() => void handleSubmit()}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  pickerField: {
    gap: 8,
  },
  pickerLabel: {
    color: AppTheme.colors.ink,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  pickerInput: {
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
  pickerValue: {
    color: AppTheme.colors.ink,
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  sexWrap: {
    gap: 10,
  },
  sexRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sexChip: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.pill,
    flex: 1,
    paddingVertical: 14,
  },
  sexChipActive: {
    backgroundColor: AppTheme.colors.accentSoft,
    borderColor: AppTheme.colors.accent,
    borderWidth: 1,
  },
  sexChipText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  sexChipTextActive: {
    color: AppTheme.colors.accent,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  footerText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
  },
  footerLink: {
    color: AppTheme.colors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
});
