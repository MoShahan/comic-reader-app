import { DEFAULT_SETTINGS } from '@/constants/settings';
import { getDb } from '@/db/database';

import type { AppSettings, FitMode, ReadingDirection, ThemeMode } from '@/types/comic';

async function getValue(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

async function setValue(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}

export async function getSettings(): Promise<AppSettings> {
  const themeMode = (await getValue('themeMode')) as ThemeMode | null;
  const autoSplitSpreads = await getValue('autoSplitSpreads');
  const defaultFit = (await getValue('defaultFit')) as FitMode | null;
  const defaultDirection = (await getValue('defaultDirection')) as ReadingDirection | null;

  return {
    themeMode: themeMode ?? DEFAULT_SETTINGS.themeMode,
    autoSplitSpreads:
      autoSplitSpreads === null ? DEFAULT_SETTINGS.autoSplitSpreads : autoSplitSpreads === '1',
    defaultFit: defaultFit ?? DEFAULT_SETTINGS.defaultFit,
    defaultDirection: defaultDirection ?? DEFAULT_SETTINGS.defaultDirection,
  };
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  if (patch.themeMode !== undefined) {
    await setValue('themeMode', patch.themeMode);
  }
  if (patch.autoSplitSpreads !== undefined) {
    await setValue('autoSplitSpreads', patch.autoSplitSpreads ? '1' : '0');
  }
  if (patch.defaultFit !== undefined) {
    await setValue('defaultFit', patch.defaultFit);
  }
  if (patch.defaultDirection !== undefined) {
    await setValue('defaultDirection', patch.defaultDirection);
  }
}
