import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { AppTheme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import type { AppPreferences } from '@/types/auth';
import { getInitials } from '@/utils/format';
import { storage } from '@/utils/storage';

function SettingRow({
  icon,
  label,
  description,
  right,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  description: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons color={AppTheme.colors.accent} name={icon} size={18} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {right ?? <Ionicons color={AppTheme.colors.muted} name="chevron-forward" size={18} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { markOnboardingSeen, refreshProfile, signOut, user } = useAuth();
  const [preferences, setPreferences] = useState<AppPreferences | null>(null);

  useEffect(() => {
    void loadPreferences();
  }, []);

  async function loadPreferences() {
    const nextPreferences = await storage.getPreferences();
    setPreferences(nextPreferences);
  }

  async function updatePreference<Key extends keyof AppPreferences>(key: Key, value: AppPreferences[Key]) {
    const nextPreferences = await storage.updatePreferences({
      [key]: value,
    } as Partial<AppPreferences>);
    setPreferences(nextPreferences);
  }

  async function handleLogout() {
    Alert.alert('Đăng xuất', 'Bạn muốn xoá phiên hiện tại trên mobile app?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          void signOut().then(() => {
            router.replace('/(auth)/login');
          });
        },
      },
    ]);
  }

  async function handleReplayOnboarding() {
    Alert.alert('Xem lại onboarding', 'Cờ onboarding sẽ được đặt lại cho thiết bị này.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đặt lại',
        onPress: () => {
          void markOnboardingSeen(false).then(() => {
            router.replace('/onboarding');
          });
        },
      },
    ]);
  }

  if (!preferences) {
    return (
      <Screen scroll={false}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={AppTheme.colors.accent} size="large" />
          <Text style={styles.loaderText}>Đang tải cài đặt...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Cài đặt</Text>
        <Text style={styles.subtitle}>
          Session, tuỳ chọn giao diện và các hành động hỗ trợ đều được gom về một chỗ.
        </Text>
      </View>

      {user ? (
        <SectionCard
          eyebrow="Session"
          subtitle="Thông tin rút gọn lấy từ session và endpoint profile."
          title="Tài khoản hiện tại"
        >
          <View style={styles.profileRow}>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>{getInitials(user.username)}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>{user.username}</Text>
              <Text style={styles.profileMeta}>{user.role}</Text>
              {user.email ? <Text style={styles.profileMeta}>{user.email}</Text> : null}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              void refreshProfile();
            }}
            style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Làm mới hồ sơ</Text>
          </TouchableOpacity>
        </SectionCard>
      ) : (
        <EmptyState
          icon="person-outline"
          message="Không tìm thấy session đang hoạt động."
          title="Chưa có người dùng"
        />
      )}

      <SectionCard
        eyebrow="Preferences"
        subtitle="Những công tắc này hiện được lưu cục bộ trên thiết bị qua AsyncStorage."
        title="Tuỳ chọn giao diện"
      >
        <SettingRow
          description="Hiển thị nhắc việc và cập nhật trạng thái trên mobile."
          icon="notifications-outline"
          label="Thông báo"
          right={
            <Switch
              onValueChange={(value) => {
                void updatePreference('notificationsEnabled', value);
              }}
              thumbColor="#FFFFFF"
              trackColor={{
                false: AppTheme.colors.surfaceStrong,
                true: AppTheme.colors.accent,
              }}
              value={preferences.notificationsEnabled}
            />
          }
        />

        <SettingRow
          description="Ẩn bớt số dư và số tiền trên các màn hình tổng quan."
          icon="eye-off-outline"
          label="Ẩn số dư nhạy cảm"
          right={
            <Switch
              onValueChange={(value) => {
                void updatePreference('hideSensitiveBalances', value);
              }}
              thumbColor="#FFFFFF"
              trackColor={{
                false: AppTheme.colors.surfaceStrong,
                true: AppTheme.colors.accent,
              }}
              value={preferences.hideSensitiveBalances}
            />
          }
        />

        <SettingRow
          description="Đánh dấu tuỳ chọn sẵn sàng cho lần tích hợp sinh trắc học tiếp theo."
          icon="finger-print-outline"
          label="Sinh trắc học"
          right={
            <Switch
              onValueChange={(value) => {
                void updatePreference('biometricEnabled', value);
              }}
              thumbColor="#FFFFFF"
              trackColor={{
                false: AppTheme.colors.surfaceStrong,
                true: AppTheme.colors.accent,
              }}
              value={preferences.biometricEnabled}
            />
          }
        />

        <SettingRow
          description="Rút gọn số tiền lớn trong thẻ và widget tổng quan."
          icon="resize-outline"
          label="Số ngắn gọn"
          right={
            <Switch
              onValueChange={(value) => {
                void updatePreference('compactNumbers', value);
              }}
              thumbColor="#FFFFFF"
              trackColor={{
                false: AppTheme.colors.surfaceStrong,
                true: AppTheme.colors.accent,
              }}
              value={preferences.compactNumbers}
            />
          }
        />
      </SectionCard>

      <SectionCard
        eyebrow="Utilities"
        subtitle="Một số hành động hỗ trợ cho vòng kiểm thử và bàn giao dự án."
        title="Công cụ hệ thống"
      >
        <SettingRow
          description="Đưa người dùng quay lại chuỗi giới thiệu ứng dụng."
          icon="play-circle-outline"
          label="Xem lại onboarding"
          onPress={() => void handleReplayOnboarding()}
        />
        <SettingRow
          description="Hiện tại chỉ xoá cache cài đặt cục bộ, không tác động backend."
          icon="trash-outline"
          label="Làm sạch trạng thái mobile"
          onPress={() =>
            Alert.alert(
              'Trạng thái mobile',
              'Các cờ local như onboarding và preferences đang được lưu bằng AsyncStorage trong fintech-mobile.'
            )
          }
        />
      </SectionCard>

      <TouchableOpacity onPress={() => void handleLogout()} style={styles.logoutButton}>
        <Ionicons color={AppTheme.colors.danger} name="log-out-outline" size={18} />
        <Text style={styles.logoutText}>Đăng xuất khỏi mobile app</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  loaderWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loaderText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    marginTop: 14,
  },
  header: {
    gap: 6,
  },
  title: {
    color: AppTheme.colors.ink,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  profileBadge: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.accentSoft,
    borderRadius: AppTheme.radii.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  profileBadgeText: {
    color: AppTheme.colors.accent,
    fontSize: 16,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    color: AppTheme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  profileMeta: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  linkButtonText: {
    color: AppTheme.colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  settingIcon: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: AppTheme.radii.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  settingCopy: {
    flex: 1,
    gap: 3,
  },
  settingLabel: {
    color: AppTheme.colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  settingDescription: {
    color: AppTheme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: AppTheme.colors.dangerSoft,
    borderRadius: AppTheme.radii.pill,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
  },
  logoutText: {
    color: AppTheme.colors.danger,
    fontSize: 15,
    fontWeight: '800',
  },
});
