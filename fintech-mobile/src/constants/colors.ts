import { AppTheme } from './theme';

export const Colors = {
  ...AppTheme.colors,
  primary: AppTheme.colors.accent,
  primaryLight: AppTheme.colors.accentAlt,
  primaryDark: AppTheme.colors.navy,
  primarySoft: AppTheme.colors.accentSoft,
  secondary: AppTheme.colors.gold,
  secondaryLight: '#F59E0B',
  secondaryDark: '#B45309',
  gray50: '#F8FAFC',
  gray100: '#EEF2F7',
  gray200: '#D8E1EC',
  gray300: '#C2CDD8',
  gray400: '#97A5B6',
  gray500: '#708092',
  gray600: '#556275',
  gray700: '#384659',
  gray800: AppTheme.colors.ink,
  gray900: '#0F172A',
  info: '#0EA5E9',
} as const;
