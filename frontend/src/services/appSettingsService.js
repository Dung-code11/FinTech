const SETTINGS_STORAGE_KEY = 'fintech.appSettings';
const LAST_TAB_STORAGE_KEY = 'fintech.lastDashboardTab';

export const DEFAULT_APP_SETTINGS = {
  defaultTab: 'home',
  rememberLastTab: true,
  showChatButton: true,
  showQuickPrompts: true,
};

const ALLOWED_TABS = new Set([
  'home',
  'transactions',
  'currency',
  'budget',
  'debt',
  'savings',
  'settings',
  'admin',
]);

const ALLOWED_DEFAULT_TABS = new Set([
  'home',
  'transactions',
  'currency',
  'settings',
]);

const normalizeTab = (tab, fallback = 'home') => {
  if (typeof tab !== 'string') {
    return fallback;
  }

  return ALLOWED_TABS.has(tab) ? tab : fallback;
};

const normalizeDefaultTab = (tab) => {
  if (typeof tab !== 'string') {
    return DEFAULT_APP_SETTINGS.defaultTab;
  }

  return ALLOWED_DEFAULT_TABS.has(tab) ? tab : DEFAULT_APP_SETTINGS.defaultTab;
};

export const getAppSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      ...DEFAULT_APP_SETTINGS,
      ...parsed,
      defaultTab: normalizeDefaultTab(parsed?.defaultTab),
      rememberLastTab:
        typeof parsed?.rememberLastTab === 'boolean'
          ? parsed.rememberLastTab
          : DEFAULT_APP_SETTINGS.rememberLastTab,
      showChatButton:
        typeof parsed?.showChatButton === 'boolean'
          ? parsed.showChatButton
          : DEFAULT_APP_SETTINGS.showChatButton,
      showQuickPrompts:
        typeof parsed?.showQuickPrompts === 'boolean'
          ? parsed.showQuickPrompts
          : DEFAULT_APP_SETTINGS.showQuickPrompts,
    };
  } catch (error) {
    console.error('Get app settings error:', error);
    return { ...DEFAULT_APP_SETTINGS };
  }
};

export const saveAppSettings = (settings) => {
  const nextSettings = {
    ...getAppSettings(),
    ...settings,
    defaultTab: normalizeDefaultTab(settings?.defaultTab),
  };

  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  return nextSettings;
};

export const resetAppSettings = () => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
  localStorage.removeItem(LAST_TAB_STORAGE_KEY);
  return { ...DEFAULT_APP_SETTINGS };
};

export const getLastDashboardTab = () => {
  try {
    const raw = localStorage.getItem(LAST_TAB_STORAGE_KEY);
    return normalizeTab(raw, null);
  } catch (error) {
    console.error('Get last dashboard tab error:', error);
    return null;
  }
};

export const setLastDashboardTab = (tab) => {
  const normalizedTab = normalizeTab(tab, null);

  if (!normalizedTab) {
    return;
  }

  localStorage.setItem(LAST_TAB_STORAGE_KEY, normalizedTab);
};

export const clearLastDashboardTab = () => {
  localStorage.removeItem(LAST_TAB_STORAGE_KEY);
};

export const resolveInitialDashboardTab = () => {
  const settings = getAppSettings();

  if (settings.rememberLastTab) {
    const lastTab = getLastDashboardTab();
    if (lastTab) {
      return lastTab;
    }
  }

  return settings.defaultTab;
};

