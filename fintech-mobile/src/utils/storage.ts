import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppPreferences, StoredSession } from '@/types/auth';

const STORAGE_KEYS = {
  onboardingSeen: 'fintrack:onboardingSeen',
  session: 'fintrack:session',
  preferences: 'fintrack:preferences',
} as const;

const DEFAULT_PREFERENCES: AppPreferences = {
  notificationsEnabled: true,
  hideSensitiveBalances: false,
  biometricEnabled: false,
  compactNumbers: true,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const rawValue = await AsyncStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  keys: STORAGE_KEYS,

  async getOnboardingSeen() {
    return (await AsyncStorage.getItem(STORAGE_KEYS.onboardingSeen)) === 'true';
  },

  async setOnboardingSeen(value: boolean) {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingSeen, String(value));
  },

  async getSession() {
    return readJson<StoredSession | null>(STORAGE_KEYS.session, null);
  },

  async setSession(session: StoredSession) {
    await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  },

  async getToken() {
    const session = await storage.getSession();
    return session?.token ?? null;
  },

  async clearSession() {
    await AsyncStorage.removeItem(STORAGE_KEYS.session);
  },

  async getPreferences() {
    return readJson<AppPreferences>(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES);
  },

  async updatePreferences(partial: Partial<AppPreferences>) {
    const current = await storage.getPreferences();
    const next = { ...current, ...partial };
    await AsyncStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(next));
    return next;
  },
};
