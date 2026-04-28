import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { AppTheme } from '@/constants/theme';

interface AuthShellProps {
  badge: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({
  badge,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <LinearGradient colors={AppTheme.gradients.auth} style={styles.root}>
      <Screen
        contentContainerStyle={styles.content}
        edges={['top', 'bottom']}
        style={styles.transparent}
      >
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.formCard}>{children}</View>
        <View style={styles.footer}>{footer}</View>
      </Screen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  hero: {
    gap: 12,
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: AppTheme.colors.accentSoft,
    borderRadius: AppTheme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: AppTheme.colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: AppTheme.colors.ink,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  subtitle: {
    color: AppTheme.colors.inkSoft,
    fontSize: 15,
    lineHeight: 23,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderColor: AppTheme.colors.line,
    borderRadius: AppTheme.radii.xl,
    borderWidth: 1,
    gap: 16,
    padding: 18,
    ...AppTheme.shadow.card,
  },
  footer: {
    alignItems: 'center',
    marginTop: 18,
  },
});
