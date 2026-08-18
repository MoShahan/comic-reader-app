import { useCallback, useEffect, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { confirmClearLibrarySandbox } from '@/services/confirmDelete';
import { getLibraryStorageStats } from '@/services/storageStats';
import { useTheme, spacing, typography, radii } from '@/theme';

import type { ThemeMode } from '@/types/comic';

function OptionRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.block}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: value === opt.value ? colors.accentSoft : colors.surface,
                borderColor: value === opt.value ? colors.accent : colors.border,
              },
            ]}
          >
            <Text style={{ color: colors.text, ...typography.caption }}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function SettingsScreen() {
  const { colors, mode, setMode, settings, patchSettings } = useTheme();
  const insets = useSafeAreaInsets();
  const [storage, setStorage] = useState({ label: '…', comicFolders: 0 });

  const refreshStorage = useCallback(async () => {
    const stats = await getLibraryStorageStats();
    setStorage({ label: stats.label, comicFolders: stats.comicFolders });
  }, []);

  useEffect(() => {
    void refreshStorage();
  }, [refreshStorage]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingBottom: insets.bottom + spacing.xl,
      }}
    >
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <OptionRow<ThemeMode>
        label="Theme"
        value={mode}
        onChange={(v) => void setMode(v)}
        options={[
          { value: 'system', label: 'System' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />

      <View style={[styles.switchRow, styles.block]}>
        <View style={styles.switchCopy}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Auto-split double pages</Text>
          <Text style={[styles.switchHint, { color: colors.muted }]}>
            In portrait, show wide spreads as left then right half
          </Text>
        </View>
        <Switch
          value={settings.autoSplitSpreads}
          onValueChange={(v) => void patchSettings({ autoSplitSpreads: v })}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.border}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.muted }]}>Library storage</Text>
        <Text style={[styles.storage, { color: colors.text }]}>{storage.label}</Text>
        <Text style={{ color: colors.muted, ...typography.caption }}>
          {storage.comicFolders} comic folder
          {storage.comicFolders === 1 ? '' : 's'} in app sandbox
        </Text>
        <View style={styles.storageActions}>
          <Pressable onPress={() => void refreshStorage()}>
            <Text style={{ color: colors.accent, ...typography.button }}>Refresh</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              confirmClearLibrarySandbox({
                onCleared: () => {
                  void refreshStorage();
                },
              })
            }
            disabled={storage.comicFolders === 0}
          >
            <Text
              style={{
                color: storage.comicFolders === 0 ? colors.muted : colors.danger,
                ...typography.button,
                opacity: storage.comicFolders === 0 ? 0.5 : 1,
              }}
            >
              Clear sandbox
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.formatNote, { color: colors.muted }]}>
          Clear sandbox removes comics from the app only. Originals in your comics folder stay on
          the device.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.muted }]}>Formats</Text>

        <Text style={[styles.formatHeading, { color: colors.text }]}>Supported</Text>
        <Text style={[styles.formatBody, { color: colors.muted }]}>
          · CBZ - comic book ZIP (preferred){'\n'}· ZIP - plain ZIP of page images
        </Text>
        <Text style={[styles.formatNote, { color: colors.muted }]}>
          Both work in Expo Go. Put files in a folder, then use Select folder on the library screen.
        </Text>

        <Text style={[styles.formatHeading, { color: colors.text, marginTop: spacing.md }]}>
          Not supported
        </Text>
        <Text style={[styles.formatBody, { color: colors.muted }]}>
          · CBR - RAR archive (needs native UnRAR; not available in Expo Go)
        </Text>

        <Text style={[styles.formatHeading, { color: colors.text, marginTop: spacing.md }]}>
          Convert CBR → CBZ
        </Text>
        <Text style={[styles.formatBody, { color: colors.muted }]}>
          1. Open the .cbr in 7-Zip or WinRAR{'\n'}
          2. Extract all page images to a folder{'\n'}
          3. Zip that folder and rename .zip → .cbz{'\n'}
          4. Move the .cbz into your comics folder and select it in the app
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.muted }]}>Library</Text>
        <Text style={{ color: colors.text, ...typography.body }}>
          Use Select folder on the library screen (Android). Comic Reader scans that folder for CBZ
          and ZIP files and adds them to your shelf.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.display, marginBottom: spacing.lg },
  block: { marginBottom: spacing.lg },
  label: {
    ...typography.caption,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  switchCopy: { flex: 1, gap: spacing.xs },
  switchLabel: { ...typography.subtitle, fontSize: 16 },
  switchHint: { ...typography.caption, lineHeight: 16 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  storage: { ...typography.title, marginBottom: spacing.xs },
  storageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  formatHeading: { ...typography.button, marginBottom: spacing.xs },
  formatBody: { ...typography.body, lineHeight: 22 },
  formatNote: { ...typography.caption, marginTop: spacing.sm, lineHeight: 18 },
  footer: { ...typography.caption, marginTop: spacing.lg, lineHeight: 18 },
});
