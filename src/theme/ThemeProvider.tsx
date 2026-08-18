import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useColorScheme } from 'react-native';

import { DEFAULT_SETTINGS } from '@/constants/settings';
import { getSettings, updateSettings } from '@/db/settingsRepository';
import { darkColors, lightColors, type AppColors } from '@/theme/colors';

import type { AppSettings, ThemeMode } from '@/types/comic';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  colors: AppColors;
  settings: AppSettings;
  patchSettings: (patch: Partial<AppSettings>) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void getSettings().then((next) => {
      setSettings(next);
      setReady(true);
    });
  }, []);

  const setMode = useCallback(async (mode: ThemeMode) => {
    await updateSettings({ themeMode: mode });
    setSettings((prev) => ({ ...prev, themeMode: mode }));
  }, []);

  const patchSettings = useCallback(async (patch: Partial<AppSettings>) => {
    await updateSettings(patch);
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const isDark =
    settings.themeMode === 'system' ? system === 'dark' : settings.themeMode === 'dark';

  const value = useMemo(
    () => ({
      mode: settings.themeMode,
      setMode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      settings,
      patchSettings,
    }),
    [settings, setMode, isDark, patchSettings],
  );

  if (!ready) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
