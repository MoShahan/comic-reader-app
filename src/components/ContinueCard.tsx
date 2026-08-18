import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { useTheme, spacing, radii, typography } from '@/theme';

import type { Comic } from '@/types/comic';

type Props = {
  comic: Comic;
  onPress: () => void;
};

export function ContinueCard({ comic, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Image source={{ uri: comic.coverPath }} style={styles.cover} contentFit="cover" />
      <View style={styles.body}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>Continue reading</Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {comic.title}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          Page {comic.currentPage + 1} of {comic.pageCount}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  cover: { width: 92, height: 128 },
  body: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  eyebrow: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: { ...typography.subtitle, marginTop: spacing.xs },
  meta: { ...typography.caption, marginTop: spacing.sm },
});
