import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { AppTheme } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: AppTheme.colors.background,
        },
        tabBarActiveTintColor: AppTheme.colors.accent,
        tabBarInactiveTintColor: AppTheme.colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        },
        tabBarStyle: {
          backgroundColor: AppTheme.colors.surface,
          borderColor: AppTheme.colors.line,
          borderRadius: 26,
          borderTopWidth: 1,
          bottom: 16,
          height: Platform.OS === 'ios' ? 78 : 74,
          left: 16,
          paddingBottom: Platform.OS === 'ios' ? 12 : 6,
          paddingTop: 8,
          position: 'absolute',
          right: 16,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="grid-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Giao dịch',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="swap-horizontal-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Ví',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="wallet-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="currency"
        options={{
          title: 'Công cụ',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="sparkles-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài đặt',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="settings-outline" size={size} />,
        }}
      />
    </Tabs>
  );
}
