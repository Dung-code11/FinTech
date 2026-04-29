import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function LaunchScreen() {
  const { hasSeenOnboarding, isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <LinearGradient colors={AppTheme.gradients.hero} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.logoRing}>
            <Text style={styles.logoText}>FT</Text>
          </View>
          <Text style={styles.title}>FinTrack Mobile</Text>
          <Text style={styles.subtitle}>Toàn bộ nhịp tài chính cá nhân gói trong một giao diện di động rõ ràng.</Text>
          <ActivityIndicator color="#FFFFFF" size="small" style={styles.loader} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: AppTheme.radii.xl,
    borderWidth: 1,
    height: 94,
    justifyContent: 'center',
    marginBottom: 18,
    width: 94,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: AppTheme.fonts.extrabold,
    letterSpacing: 1.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: AppTheme.fonts.extrabold,
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    fontFamily: AppTheme.fonts.regular,
    lineHeight: 22,
    textAlign: 'center',
  },
  loader: {
    marginTop: 28,
  },
});
