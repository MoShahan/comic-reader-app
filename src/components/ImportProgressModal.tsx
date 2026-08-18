import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme, spacing, radii, typography } from '@/theme';

import type { ImportProgress } from '@/types/comic';

type Props = {
  visible: boolean;
  progress: ImportProgress | null;
  onCancel: () => void;
  onRunInBackground: () => void;
};

export function ImportProgressModal({ visible, progress, onCancel, onRunInBackground }: Props) {
  const { colors } = useTheme();
  const ratio = progress && progress.total > 0 ? Math.min(1, progress.current / progress.total) : 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>Adding from folder</Text>
          <Text style={[styles.message, { color: colors.muted }]}>
            {progress?.message ?? 'Working…'}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.progressTrack }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${ratio * 100}%`,
                  backgroundColor: colors.progressFill,
                },
              ]}
            />
          </View>
          <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.md }} />

          <Pressable
            onPress={onRunInBackground}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.primaryText}>Add in background</Text>
          </Pressable>
          <Text style={[styles.hint, { color: colors.muted }]}>
            Keep using the app — comics appear on your shelf as they finish.
          </Text>

          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.danger }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: { width: '100%', borderRadius: radii.lg, padding: spacing.lg },
  title: { ...typography.title },
  message: { ...typography.body, marginTop: spacing.sm },
  track: {
    height: 6,
    borderRadius: 3,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  fill: { height: '100%' },
  primaryBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', ...typography.button },
  hint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  cancelBtn: {
    alignSelf: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  cancelText: { ...typography.button },
});
