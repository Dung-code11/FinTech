import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';

const SettingItem = ({ icon, title, subtitle, onPress, rightElement }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingLeft}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {rightElement || <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />}
  </TouchableOpacity>
);

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('role');
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Xóa bộ nhớ cache',
      'Dữ liệu tạm thời sẽ bị xóa. Thao tác này không ảnh hưởng đến dữ liệu tài khoản của bạn.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: () => {
            Alert.alert('Thành công', 'Đã xóa bộ nhớ cache');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle-outline" size={80} color={Colors.gray300} />
          </View>
          <Text style={styles.userName}>Nguyễn Văn A</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <Section title="Tùy chọn">
          <SettingItem
            icon="notifications-outline"
            title="Thông báo"
            subtitle="Nhận thông báo về giao dịch và khuyến mãi"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.gray200, true: Colors.primary }}
                thumbColor="#fff"
              />
            }
          />
          <SettingItem
            icon="moon-outline"
            title="Chế độ tối"
            subtitle="Chuyển đổi giao diện sáng/tối"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.gray200, true: Colors.primary }}
                thumbColor="#fff"
              />
            }
          />
          <SettingItem
            icon="finger-print-outline"
            title="Xác thực vân tay"
            subtitle="Đăng nhập bằng vân tay / Face ID"
            rightElement={
              <Switch
                value={biometric}
                onValueChange={setBiometric}
                trackColor={{ false: Colors.gray200, true: Colors.primary }}
                thumbColor="#fff"
              />
            }
          />
          <SettingItem
            icon="sync-outline"
            title="Tự động đồng bộ"
            subtitle="Đồng bộ dữ liệu với cloud"
            rightElement={
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: Colors.gray200, true: Colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </Section>

        {/* Security */}
        <Section title="Bảo mật">
          <SettingItem
            icon="lock-closed-outline"
            title="Đổi mật khẩu"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Xác thực 2 lớp"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
          <SettingItem
            icon="eye-off-outline"
            title="Ẩn số dư"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
        </Section>

        {/* Data & Storage */}
        <Section title="Dữ liệu & Lưu trữ">
          <SettingItem
            icon="cloud-upload-outline"
            title="Sao lưu dữ liệu"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
          <SettingItem
            icon="trash-outline"
            title="Xóa bộ nhớ cache"
            onPress={handleClearCache}
          />
          <SettingItem
            icon="document-text-outline"
            title="Xuất dữ liệu"
            subtitle="Xuất báo cáo tài chính"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
        </Section>

        {/* Support */}
        <Section title="Hỗ trợ">
          <SettingItem
            icon="help-circle-outline"
            title="Trung tâm trợ giúp"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
          <SettingItem
            icon="chatbubble-outline"
            title="Phản hồi & Góp ý"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
          <SettingItem
            icon="information-circle-outline"
            title="Giới thiệu"
            subtitle="Phiên bản 1.0.0"
            onPress={() => Alert.alert('Thông báo', 'FinTech - Quản lý tài chính thông minh')}
          />
        </Section>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>FinTech Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  avatar: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray800,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.gray500,
    marginBottom: 16,
  },
  editProfileBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
  },
  editProfileText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray800,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.gray400,
    marginTop: 24,
    marginBottom: 40,
  },
});